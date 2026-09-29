import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccessService, type Actor } from '../access/access.service.js';
export const documentMetadata = {
  id_documento: true, nome_arquivo: true, tipo: true,
  data_upload: true, id_processo: true, id_usuario: true,
} as const;
@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService) {}
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
}
