import { Module } from '@nestjs/common';
import { ProcessosService } from './processos.service.js';
import { ProcessosController } from './processos.controller.js';

@Module({
  controllers: [ProcessosController],
  providers: [ProcessosService],
})
export class ProcessosModule {}
