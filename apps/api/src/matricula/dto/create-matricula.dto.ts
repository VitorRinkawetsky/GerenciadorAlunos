import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class CreateMatriculaDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  alunoId!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  disciplinaId!: number;
}
