import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UploadedFile, UseInterceptors, StreamableFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { Actor } from '../access/access.service.js';
import { DocumentosService } from './documentos.service.js';
import { UploadDocumentoDto, BackupDocumentosDto, ArquivarDocumentoDto } from './dto/upload-documento.dto.js';
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}
  @Get() list(@CurrentUser() user: Actor, @Query('id_processo', new ParseIntPipe({ optional: true })) id?: number) { return this.service.findAll(user, id); }
  @Get('uso') usage(@CurrentUser() user: Actor) { return this.service.usage(user); }
  @Post() @Roles('ADMINISTRADOR', 'ADVOGADO') @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 5_000_000, files: 1 } }))
  upload(@CurrentUser() user: Actor, @Body() dto: UploadDocumentoDto, @UploadedFile() file?: { originalname: string; buffer: Buffer }) {
    if (!file) throw new BadRequestException('Selecione um PDF.');
    return this.service.upload(user, dto, file.originalname, file.buffer);
  }
  @Roles('ADMINISTRADOR', 'ADVOGADO')
  @Post('comprimir') @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 20_000_000, files: 1 } }))
  async compress(@CurrentUser() user: Actor, @UploadedFile() file?: { buffer: Buffer }) {
    if (!file) throw new BadRequestException('Selecione um PDF de até 20 MB para otimização.');
    return new StreamableFile(await this.service.compress(user, file.buffer), { type: 'application/pdf', disposition: 'attachment; filename="documento-otimizado.pdf"' });
  }
  @Roles('ADMINISTRADOR')
  @Post('backup') async backup(@CurrentUser() user: Actor, @Body() dto: BackupDocumentosDto) {
    return new StreamableFile(await this.service.backup(user, dto.ids), { type: 'application/zip', disposition: 'attachment; filename="backup-documentos.zip"' });
  }
  @Get(':id/download') async download(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor) {
    const { bytes } = await this.service.download(id, user);
    return new StreamableFile(bytes, { type: 'application/pdf', disposition: `attachment; filename="documento-${id}.pdf"` });
  }
  @Roles('ADMINISTRADOR')
  @Post(':id/arquivar') archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor, @Body() dto: ArquivarDocumentoDto) { return this.service.archive(id, user, dto); }
  @Get(':id') get(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Actor) { return this.service.findOne(id, user); }
}
