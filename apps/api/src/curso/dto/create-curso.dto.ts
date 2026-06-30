import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  descricao!: string;
}
