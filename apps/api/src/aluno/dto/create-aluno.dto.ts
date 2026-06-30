import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateAlunoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nome!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  matricula!: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  cursoId!: number;
}
