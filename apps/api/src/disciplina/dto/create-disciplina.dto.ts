import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsInt,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayUnique,
  Max,
} from 'class-validator';

export class CreateDisciplinaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  codigo!: string;

  @IsInt()
  @IsPositive()
  @Max(400)
  cargaHoraria!: number;

  @IsInt()
  @IsPositive()
  @Max(500)
  limiteVagas!: number;

  @IsInt()
  @IsPositive()
  cursoId!: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  prerequisitoIds?: number[];

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}
