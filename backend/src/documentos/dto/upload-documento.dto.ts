import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, IsArray, ArrayMinSize, ArrayMaxSize, IsBoolean, IsString, Matches } from 'class-validator';
export class UploadDocumentoDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) id_processo?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) id_cliente?: number;
}
export class BackupDocumentosDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(8) @IsInt({ each: true }) @Min(1, { each: true }) ids: number[];
}
export class ArquivarDocumentoDto {
  @IsBoolean() backup_conferido: boolean;
  @IsString() @Matches(/^[a-f0-9]{64}$/) sha256: string;
}
