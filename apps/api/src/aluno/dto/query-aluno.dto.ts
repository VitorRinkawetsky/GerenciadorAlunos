import { IsOptional, IsString, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryAlunoDto extends PaginationDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cursoId?: number;
}
