import { Module } from '@nestjs/common';
import { AlunoService } from './aluno.service';
import { AlunoController } from './aluno.controller';
import { CursoModule } from '../curso/curso.module';

@Module({
  imports: [CursoModule],
  controllers: [AlunoController],
  providers: [AlunoService],
})
export class AlunoModule {}
