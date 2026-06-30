import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAlunoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  matricula?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cursoId?: number;
}
