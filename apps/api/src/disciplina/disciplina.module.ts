import { Module } from '@nestjs/common';
import { DisciplinaService } from './disciplina.service';
import { DisciplinaController } from './disciplina.controller';
import { CursoModule } from '../curso/curso.module';

@Module({
  imports: [CursoModule],
  controllers: [DisciplinaController],
  providers: [DisciplinaService],
  exports: [DisciplinaService],
})
export class DisciplinaModule {}
