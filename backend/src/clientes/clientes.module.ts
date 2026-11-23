import { Module } from '@nestjs/common';
import { DocumentosModule } from '../documentos/documentos.module.js';
import { ClientesService } from './clientes.service.js';
import { ClientesController } from './clientes.controller.js';

@Module({
  imports: [DocumentosModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
