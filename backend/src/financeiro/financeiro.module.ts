import { Module } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service.js';
import { FinanceiroController } from './financeiro.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}
