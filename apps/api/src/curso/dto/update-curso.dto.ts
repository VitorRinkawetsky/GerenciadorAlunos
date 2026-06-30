import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCursoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nome?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  descricao?: string;
}
