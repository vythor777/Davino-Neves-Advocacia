import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccessService, type Actor } from '../access/access.service.js';
import { CreateAgendaDto } from './dto/create-agenda.dto.js';
import { UpdateAgendaDto } from './dto/update-agenda.dto.js';
@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService) {}
  create(dto: CreateAgendaDto, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    return this.prisma.agenda.create({ data: { ...dto, data_evento: new Date(dto.data_evento), id_usuario: user.id_usuario } });
  }
  findAll(user: Actor) {
    return this.prisma.agenda.findMany({ where: user.role === 'ADMINISTRADOR' ? {} : { id_usuario: user.id_usuario }, orderBy: { data_evento: 'asc' } });
  }
  async findOne(id: number, user: Actor) {
    const item = await this.prisma.agenda.findFirst({ where: { id_agenda: id, ...(user.role === 'ADMINISTRADOR' ? {} : { id_usuario: user.id_usuario }) } });
    if (!item) throw new NotFoundException('Compromisso não encontrado.');
    return item;
  }
  async update(id: number, dto: UpdateAgendaDto, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    await this.findOne(id, user);
    return this.prisma.agenda.update({ where: { id_agenda: id }, data: { ...dto, ...(dto.data_evento ? { data_evento: new Date(dto.data_evento) } : {}) } });
  }
  async remove(id: number, user: Actor) {
    this.access.requireRole(user, 'ADMINISTRADOR', 'ADVOGADO');
    await this.findOne(id, user);
    return this.prisma.agenda.delete({ where: { id_agenda: id } });
  }
}
