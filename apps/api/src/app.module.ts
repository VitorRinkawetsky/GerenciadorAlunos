import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CursoModule } from './curso/curso.module';
import { AlunoModule } from './aluno/aluno.module';
import { DisciplinaModule } from './disciplina/disciplina.module';
import { MatriculaModule } from './matricula/matricula.module';

@Module({
  imports: [CursoModule, AlunoModule, DisciplinaModule, MatriculaModule],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
