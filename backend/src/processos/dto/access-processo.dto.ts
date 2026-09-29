import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
export class AccessProcessoDto {
  @ValidateIf((_o, value) => value !== null)
  @IsInt()
  @Min(1)
  id_responsavel: number | null;

  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  participantes: number[];
}
