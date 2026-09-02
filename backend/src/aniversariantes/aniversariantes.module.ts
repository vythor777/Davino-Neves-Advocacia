import { Module } from '@nestjs/common';
import { AniversariantesService } from './aniversariantes.service.js';
import { AniversariantesController } from './aniversariantes.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AniversariantesController],
  providers: [AniversariantesService],
})
export class AniversariantesModule {}
