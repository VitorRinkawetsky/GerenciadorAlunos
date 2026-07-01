import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryDisciplinaDto extends PaginationDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cursoId?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  ativa?: boolean;
}
