import { Injectable, NotFoundException, BadRequestException, ConflictException, HttpException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import JSZip from 'jszip';
import { Prisma, type Documento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccessService, type Actor } from '../access/access.service.js';
import { DocumentStorageService } from './document-storage.service.js';
import { inspectPdf, PDF_LIMIT, OFFICE_STORAGE_LIMIT } from './pdf-validation.js';
import type { UploadDocumentoDto, ArquivarDocumentoDto } from './dto/upload-documento.dto.js';
export const documentMetadata = {
  id_documento: true, nome_arquivo: true, tipo: true, tamanho_bytes: true, sha256: true, situacao: true, arquivado_em: true,
  data_upload: true, id_processo: true, id_cliente: true, id_usuario: true, acesso_restrito: true,
} as const;
@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService, private readonly storage: DocumentStorageService) {}
  private scope(user: Actor): Prisma.DocumentoWhereInput {
    if (user.role === 'ADMINISTRADOR') return {};
    const scope = this.access.processScope(user);
    if (user.role === 'ESTAGIARIO') {
      // O cadastro de clientes é compartilhado. Documentos dos autos seguem o acesso do processo.
      return { acesso_restrito: false, OR: [{ id_processo: null }, { processo: scope }] };
    }
    return { acesso_restrito: false, OR: [
      { processo: scope },
      { id_processo: null, id_cliente: { not: null }, id_usuario: user.id_usuario },
      { id_processo: null, cliente: { processos: { some: scope } } },
      { id_processo: null, id_cliente: null },
    ] };
  }
  async findAll(user: Actor, processId?: number, clientId?: number) {
    if (processId !== undefined) await this.access.process(user, processId);
    const filters: Prisma.DocumentoWhereInput[] = [this.scope(user)];
    if (processId !== undefined) filters.push({ id_processo: processId });
    if (clientId !== undefined) filters.push({ OR: [{ id_processo: null, id_cliente: clientId }, { processo: { id_cliente: clientId } }] });
    return this.prisma.documento.findMany({ where: { AND: filters }, select: documentMetadata, orderBy: { data_upload: 'desc' } });
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
      const client = await this.prisma.cliente.findUnique({ where: { id_cliente: dto.id_cliente }, select: { id_cliente: true } });
      if (!client) throw new NotFoundException('Cliente não encontrado ou não liberado.');
    } else this.access.requireRole(user, 'ADMINISTRADOR');
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const path = `office/${randomUUID()}.pdf`;
    const record = await this.prisma.$transaction(async tx => {
      // Serializa a reserva de espaço para que envios simultâneos respeitem a cota.
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(932601)`;
      const sum = await tx.documento.aggregate({ where: { situacao: { not: 'ARQUIVADO' } }, _sum: { tamanho_bytes: true } });
      if ((sum._sum.tamanho_bytes || 0) + bytes.length > OFFICE_STORAGE_LIMIT) throw new BadRequestException('Espaço reservado esgotado. Solicite backup e arquivamento ao administrador.');
      return tx.documento.create({ data: { nome_arquivo: name.replace(/[\\/\x00-\x1f]/g, '_').slice(0, 250), tipo: 'application/pdf', caminho_arquivo: path, id_processo: dto.id_processo, id_cliente: dto.id_cliente, id_usuario: user.id_usuario, tamanho_bytes: bytes.length, sha256, situacao: 'EM_ENVIO' } });
    }).catch(error => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException('O vínculo mudou durante o envio. Atualize o cadastro e tente novamente.');
      }
      throw error;
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
    const claimed = await this.prisma.documento.updateMany({
      where: { id_documento: id, situacao: 'DISPONIVEL' },
      data: { situacao: 'ARQUIVANDO' },
    });
    if (!claimed.count) throw new ConflictException('O documento está sendo alterado. Atualize a lista e tente novamente.');
    try { await this.storage.remove(record.caminho_arquivo); }
    catch (error) { await this.prisma.documento.update({ where: { id_documento: id }, data: { situacao: record.situacao } }); throw error; }
    return this.prisma.documento.update({ where: { id_documento: id }, data: { situacao: 'ARQUIVADO', arquivado_em: new Date() }, select: documentMetadata });
  }

  async removeLinked(where: Prisma.DocumentoWhereInput, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    const documents = await this.prisma.documento.findMany({
      where,
      select: { id_documento: true, id_cliente: true, situacao: true, nome_arquivo: true, caminho_arquivo: true, arquivado_em: true },
    });
    for (const document of documents) this.assertRemovable(document.situacao);
    for (const document of documents) await this.deleteDocument(document, user, where);
  }

  async remove(id: number, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    const document = await this.prisma.documento.findUnique({ where: { id_documento: id } });
    if (!document) throw new NotFoundException('Documento não encontrado.');
    return this.deleteDocument(document, user);
  }

  async removeBatch(ids: number[], user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    const results = await Promise.allSettled(ids.map(id => this.remove(id, user)));
    const excluidos: Awaited<ReturnType<DocumentosService['remove']>>[] = [];
    const ausentes: number[] = [];
    const falhas: Array<{ id_documento: number; mensagem: string }> = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        excluidos.push(result.value);
      } else if (result.reason instanceof NotFoundException) {
        ausentes.push(ids[index]);
      } else {
        falhas.push({
          id_documento: ids[index],
          mensagem: result.reason instanceof HttpException
            ? result.reason.message
            : 'Não foi possível concluir a exclusão deste documento.',
        });
      }
    });
    return { excluidos, ausentes, falhas };
  }

  private assertRemovable(status: string) {
    if (status !== 'DISPONIVEL' && status !== 'ARQUIVADO' && status !== 'EXCLUINDO') {
      throw new ConflictException('Aguarde a operação atual do documento antes de excluir.');
    }
  }

  private async deleteDocument(
    document: Pick<Documento, 'id_documento' | 'id_cliente' | 'nome_arquivo' | 'situacao' | 'caminho_arquivo' | 'arquivado_em'>,
    user: Actor,
    scope: Prisma.DocumentoWhereInput = {},
  ) {
    const id = document.id_documento;
    const where = { id_documento: id };
    this.assertRemovable(document.situacao);
    const claimed = await this.prisma.documento.updateMany({
      where: { ...scope, ...where, id_cliente: document.id_cliente, situacao: document.situacao },
      data: { situacao: 'EXCLUINDO' },
    });
    if (!claimed.count) throw new ConflictException('O documento está sendo alterado. Atualize a lista e tente novamente.');
    if (document.situacao !== 'ARQUIVADO' && !document.arquivado_em) {
      await this.storage.remove(document.caminho_arquivo);
    }
    // Apaga o registro e grava a auditoria na mesma transação.
    await this.prisma.$transaction(async tx => {
      const row = await tx.documento.findUnique({ where, select: { id_cliente: true, id_processo: true } });
      const deleted = await tx.documento.deleteMany({ where: { ...where, situacao: 'EXCLUINDO' } });
      if (!row || !deleted.count) throw new NotFoundException('Documento já excluído.');
      await tx.auditLog.create({ data: {
        id_usuario: user.id_usuario, usuario: user.nome, cargo: user.role,
        acao: 'EXCLUSAO', entidade: 'documentos', registro: String(id),
        cliente_documento: row.id_cliente, processo_documento: row.id_processo,
        descricao: `Excluiu o documento “${document.nome_arquivo}”.`,
      } });
    });
    return { id_documento: id, nome_arquivo: document.nome_arquivo };
  }
}
