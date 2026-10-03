import { DocumentTextService } from './document-text.service.js';
import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service.js';
import { GeminiController } from './gemini.controller.js';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService, DocumentTextService],
  exports: [GeminiService],
})
export class GeminiModule {}
