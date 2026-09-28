import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccessService, type Actor } from '../access/access.service.js';
export interface UploadedDocument { originalname: string; mimetype: string; size: number; buffer: Buffer; }
export const documentMetadata = {
  id_documento: true, nome_arquivo: true, tipo: true, tamanho: true,
  data_upload: true, id_processo: true, id_usuario: true,
} as const;
@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService) {}
  async create(id: number, file: UploadedDocument | undefined, user: Actor) {
    await this.access.process(user, id);
    if (!file || file.size === 0 || file.size > 5 * 1024 * 1024) throw new BadRequestException('Envie um arquivo de até 5 MB.');
    const filename = file.originalname.replace(/[\/\\\x00-\x1f\x7f]/g, '_').slice(0, 255);
    if (!filename) throw new BadRequestException('Nome do arquivo inválido.');
    return this.prisma.documento.create({ data: {
      id_processo: id, id_usuario: user.id_usuario, nome_arquivo: filename,
      // Conteúdo privado no PostgreSQL: não depende do disco efêmero do Render.
      tipo: 'application/octet-stream', conteudo: file.buffer, tamanho: file.size,
    }, select: documentMetadata });
  }
  async findAll(user: Actor, id?: number) {
    if (id !== undefined) await this.access.process(user, id);
    return this.prisma.documento.findMany({ where: {
      id_processo: id, processo: this.access.processScope(user),
    }, select: documentMetadata, orderBy: { data_upload: 'desc' } });
  }
  async findOne(id: number, user: Actor) {
    const item = await this.prisma.documento.findFirst({ where: {
      id_documento: id, processo: this.access.processScope(user),
    }, select: documentMetadata });
    if (!item) throw new NotFoundException('Documento não encontrado ou não liberado.');
    return item;
  }
  async download(id: number, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    const item = await this.prisma.documento.findFirst({ where: {
      id_documento: id, processo: this.access.processScope(user),
    }, select: { nome_arquivo: true, conteudo: true } });
    if (!item?.conteudo) throw new NotFoundException('Arquivo indisponível. Documentos antigos precisam ser reenviados.');
    return item;
  }
  async remove(id: number, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR');
    await this.findOne(id, user);
    return this.prisma.documento.delete({ where: { id_documento: id }, select: documentMetadata });
  }
}
