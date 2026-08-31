import { Module } from '@nestjs/common';
import { DataJudService } from './datajud.service.js';
import { DataJudController } from './datajud.controller.js';

@Module({
  controllers: [DataJudController],
  providers: [DataJudService],
  exports: [DataJudService],
})
export class DataJudModule {}
