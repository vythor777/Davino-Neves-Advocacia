import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { Actor } from '../access/access.service.js';
import { DocumentosService, type UploadedDocument } from './documentos.service.js';
import { CreateDocumentoDto } from './dto/create-documento.dto.js';
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}
  @Post()
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 1 } }))
  create(@Body() dto: CreateDocumentoDto, @UploadedFile() file: UploadedDocument | undefined, @CurrentUser() user: Actor) {
    return this.service.create(dto.id_processo, file, user);
  }
  @Get()
  list(@CurrentUser() user: Actor, @Query('id_processo', new ParseIntPipe({ optional: true })) id?: number) {
    return this.service.findAll(user, id);
  }
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor) { return this.service.findOne(id, user); }
  @Roles('ADMINISTRADOR', 'ADVOGADO')
  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor) {
    const file = await this.service.download(id, user);
    return new StreamableFile(file.conteudo!, { type: 'application/octet-stream',
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.nome_arquivo)}` });
  }
  @Roles('ADMINISTRADOR')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor) { return this.service.remove(id, user); }
}
