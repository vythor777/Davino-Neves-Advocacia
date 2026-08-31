import { Injectable } from '@nestjs/common';
import { CreateAgendaDto } from './dto/create-agenda.dto.js';
import { UpdateAgendaDto } from './dto/update-agenda.dto.js';

@Injectable()
export class AgendaService {
  create(createAgendaDto: CreateAgendaDto) {
    return 'This action adds a new agenda';
  }

  findAll() {
    return `This action returns all agenda`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agenda`;
  }

  update(id: number, updateAgendaDto: UpdateAgendaDto) {
    return `This action updates a #${id} agenda`;
  }

  remove(id: number) {
    return `This action removes a #${id} agenda`;
  }
}
