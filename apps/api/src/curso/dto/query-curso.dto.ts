import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryCursoDto extends PaginationDto {
  @IsOptional()
  @IsString()
  nome?: string;
}
