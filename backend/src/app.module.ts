import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { ProcessosModule } from './processos/processos.module.js';
import { PrazosModule } from './prazos/prazos.module.js';
import { DocumentosModule } from './documentos/documentos.module.js';
import { AgendaModule } from './agenda/agenda.module.js';
import { DataJudModule } from './datajud/datajud.module.js';
import { GeminiModule } from './gemini/gemini.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AniversariantesModule } from './aniversariantes/aniversariantes.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ClientesModule,
    ProcessosModule,
    PrazosModule,
    DocumentosModule,
    AgendaModule,
    DataJudModule,
    GeminiModule,
    AniversariantesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
