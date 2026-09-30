import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import JSZip from 'jszip';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccessService, type Actor } from '../access/access.service.js';
import { DocumentStorageService } from './document-storage.service.js';
import { inspectPdf, PDF_LIMIT, OFFICE_STORAGE_LIMIT } from './pdf-validation.js';
import type { UploadDocumentoDto, ArquivarDocumentoDto } from './dto/upload-documento.dto.js';
export const documentMetadata = {
  id_documento: true, nome_arquivo: true, tipo: true, tamanho_bytes: true, sha256: true, situacao: true, arquivado_em: true,
  data_upload: true, id_processo: true, id_cliente: true, id_usuario: true,
} as const;
@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService, private readonly storage: DocumentStorageService) {}
  private scope(user: Actor) {
    if (user.role === 'ADMINISTRADOR') return {};
    const scope = this.access.processScope(user);
    return { OR: [{ processo: scope }, { id_processo: null, cliente: { processos: { some: scope } } }, { id_processo: null, id_cliente: null }] };
  }
  async findAll(user: Actor, id?: number) {
    if (id !== undefined) await this.access.process(user, id);
    return this.prisma.documento.findMany({ where: { AND: [this.scope(user), ...(id === undefined ? [] : [{ id_processo: id }])] }, select: documentMetadata, orderBy: { data_upload: 'desc' } });
  }
  async findOne(id: number, user: Actor) {
    const item = await this.prisma.documento.findFirst({ where: { id_documento: id, ...this.scope(user) }, select: documentMetadata });
    if (!item) throw new NotFoundException('Documento não encontrado ou não liberado.');
    return item;
  }
  async usage(user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO', 'ESTAGIARIO');
    const usage = await this.prisma.documento.aggregate({ where: { situacao: { not: 'ARQUIVADO' } }, _sum: { tamanho_bytes: true } });
    const used = usage._sum.tamanho_bytes || 0;
    return { usado: used, limite: OFFICE_STORAGE_LIMIT, max_pdf: PDF_LIMIT, percentual: Math.round(used / OFFICE_STORAGE_LIMIT * 100), alerta: used >= OFFICE_STORAGE_LIMIT * .85 ? 'CRITICO' : used >= OFFICE_STORAGE_LIMIT * .7 ? 'ATENCAO' : 'NORMAL' };
  }
  async upload(user: Actor, dto: UploadDocumentoDto, name: string, bytes: Buffer) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    await inspectPdf(bytes);
    if (dto.id_processo) {
      const process = await this.access.process(user, dto.id_processo);
      if (dto.id_cliente && dto.id_cliente !== process.id_cliente) throw new BadRequestException('O cliente informado não corresponde ao processo.');
      dto.id_cliente = process.id_cliente;
    } else if (dto.id_cliente) {
      const client = await this.prisma.cliente.findFirst({ where: { id_cliente: dto.id_cliente, ...(user.role === 'ADMINISTRADOR' ? {} : { processos: { some: this.access.processScope(user) } }) }, select: { id_cliente: true } });
      if (!client) throw new NotFoundException('Cliente não encontrado ou não liberado.');
    } else this.access.requireRole(user, 'ADMINISTRADOR');
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const path = `office/${randomUUID()}.pdf`;
    const record = await this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(932601)`;
      const sum = await tx.documento.aggregate({ where: { situacao: { not: 'ARQUIVADO' } }, _sum: { tamanho_bytes: true } });
      if ((sum._sum.tamanho_bytes || 0) + bytes.length > OFFICE_STORAGE_LIMIT) throw new BadRequestException('Espaço reservado esgotado. Solicite backup e arquivamento ao administrador.');
      return tx.documento.create({ data: { nome_arquivo: name.replace(/[\\/\x00-\x1f]/g, '_').slice(0, 250), tipo: 'application/pdf', caminho_arquivo: path, id_processo: dto.id_processo, id_cliente: dto.id_cliente, id_usuario: user.id_usuario, tamanho_bytes: bytes.length, sha256, situacao: 'EM_ENVIO' } });
    });
    try { await this.storage.upload(path, bytes); }
    catch (error) { await this.prisma.documento.delete({ where: { id_documento: record.id_documento } }); throw error; }
    return this.prisma.documento.update({ where: { id_documento: record.id_documento }, data: { situacao: 'DISPONIVEL' }, select: documentMetadata });
  }
  async download(id: number, user: Actor) {
    const metadata = await this.findOne(id, user);
    if (metadata.situacao !== 'DISPONIVEL') throw new BadRequestException('Documento indisponível na nuvem. Consulte o backup local do administrador.');
    const record = await this.prisma.documento.findUniqueOrThrow({ where: { id_documento: id } });
    const bytes = await this.storage.download(record.caminho_arquivo);
    if (record.sha256 && createHash('sha256').update(bytes).digest('hex') !== record.sha256) throw new BadRequestException('A integridade do arquivo não foi confirmada. Não arquive este documento.');
    return { metadata, bytes };
  }
  async compress(user: Actor, bytes: Buffer) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    const { pdf, signed } = await inspectPdf(bytes, 20_000_000);
    if (signed) throw new BadRequestException('Não comprima PDFs assinados digitalmente. Preserve o original.');
    const result = Buffer.from(await pdf.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false }));
    if (result.length > PDF_LIMIT) throw new BadRequestException('A otimização sem perda não reduziu o PDF a 5 MB. Divida o documento ou reduza as imagens antes de enviar.');
    return result.length < bytes.length ? result : bytes;
  }
  async backup(user: Actor, ids: number[]) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    const zip = new JSZip();
    const manifest: unknown[] = [];
    for (const id of [...new Set(ids)]) {
      const { metadata, bytes } = await this.download(id, user);
      const path = `${id}-${metadata.nome_arquivo}`;
      zip.file(path, bytes); manifest.push({ ...metadata, arquivo_backup: path });
    }
    zip.file('manifesto.json', JSON.stringify({ escritorio: 'Davino Neves Advocacia', gerado_em: new Date().toISOString(), documentos: manifest }, null, 2));
    return zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
  }
  async archive(id: number, user: Actor, dto: ArquivarDocumentoDto) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    const metadata = await this.findOne(id, user);
    if (!dto.backup_conferido || !metadata.sha256 || dto.sha256 !== metadata.sha256) throw new BadRequestException('Baixe e confira o backup antes de arquivar.');
    if (metadata.situacao === 'ARQUIVADO') return metadata;
    const record = await this.prisma.documento.findUniqueOrThrow({ where: { id_documento: id } });
    await this.prisma.documento.update({ where: { id_documento: id }, data: { situacao: 'ARQUIVANDO' } });
    try { await this.storage.remove(record.caminho_arquivo); }
    catch (error) { await this.prisma.documento.update({ where: { id_documento: id }, data: { situacao: record.situacao } }); throw error; }
    return this.prisma.documento.update({ where: { id_documento: id }, data: { situacao: 'ARQUIVADO', arquivado_em: new Date() }, select: documentMetadata });
  }
}
