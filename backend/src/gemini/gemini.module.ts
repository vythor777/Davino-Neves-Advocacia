import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service.js';
import { GeminiController } from './gemini.controller.js';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
