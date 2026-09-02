import { Module } from '@nestjs/common';
import { AniversariantesService } from './aniversariantes.service';
import { AniversariantesController } from './aniversariantes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AniversariantesController],
  providers: [AniversariantesService],
})
export class AniversariantesModule {}
