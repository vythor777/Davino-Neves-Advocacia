import { Module } from '@nestjs/common';
import { AniversariantesService } from './aniversariantes.service.js';
import { AniversariantesController } from './aniversariantes.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AniversariantesController],
  providers: [AniversariantesService],
})
export class AniversariantesModule {}
