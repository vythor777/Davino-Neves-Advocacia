import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
export class CreateDocumentoDto {
  @Type(() => Number) @IsInt() @Min(1) id_processo: number;
}
