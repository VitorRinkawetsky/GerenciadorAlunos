import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CursoModule } from './curso/curso.module';
import { AlunoModule } from './aluno/aluno.module';

@Module({
  imports: [CursoModule, AlunoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
