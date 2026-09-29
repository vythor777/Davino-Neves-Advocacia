import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateAgendaDto {
  @IsString() @IsNotEmpty() @MaxLength(100) titulo: string;
  @IsString() @MaxLength(10000) descricao: string;
  @IsDateString() data_evento: string;
  @IsString() @IsNotEmpty() @MaxLength(50) tipo: string;
}
