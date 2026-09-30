import { DocumentStorageService } from './document-storage.service.js';
import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service.js';
import { DocumentosController } from './documentos.controller.js';

@Module({
  controllers: [DocumentosController],
  providers: [DocumentosService, DocumentStorageService],
})
export class DocumentosModule {}
