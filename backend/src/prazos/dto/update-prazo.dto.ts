import { PartialType } from '@nestjs/mapped-types';
import { CreatePrazoDto } from './create-prazo.dto.js';

export class UpdatePrazoDto extends PartialType(CreatePrazoDto) {}
