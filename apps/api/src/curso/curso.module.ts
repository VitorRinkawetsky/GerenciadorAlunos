import { Module } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';

@Module({
  controllers: [CursoController],
  providers: [CursoService],
  exports: [CursoService],
})
export class CursoModule {}
