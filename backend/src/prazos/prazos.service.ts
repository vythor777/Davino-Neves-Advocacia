import { Injectable } from '@nestjs/common';
import { CreatePrazoDto } from './dto/create-prazo.dto.js';
import { UpdatePrazoDto } from './dto/update-prazo.dto.js';

@Injectable()
export class PrazosService {
  create(createPrazoDto: CreatePrazoDto) {
    return 'This action adds a new prazo';
  }

  findAll() {
    return `This action returns all prazos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prazo`;
  }

  update(id: number, updatePrazoDto: UpdatePrazoDto) {
    return `This action updates a #${id} prazo`;
  }

  remove(id: number) {
    return `This action removes a #${id} prazo`;
  }
}
