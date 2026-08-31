import { Module } from '@nestjs/common';
import { PrazosService } from './prazos.service.js';
import { PrazosController } from './prazos.controller.js';

@Module({
  controllers: [PrazosController],
  providers: [PrazosService],
  exports: [PrazosService],
})
export class PrazosModule {}
