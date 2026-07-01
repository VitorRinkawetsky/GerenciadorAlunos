import { Controller, Get, Post, Body, Param } from '@nestjs/common';

import { MatriculaService } from './matricula.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

@Controller('matriculas')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post()
  create(@Body() dto: CreateMatriculaDto) {
    return this.matriculaService.create(dto);
  }

  @Get()
  findAll() {
    return this.matriculaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matriculaService.findOne(+id);
  }

  @Get('alunos/:id/disciplinas')
  findDisciplinasByAluno(@Param('id') id: string) {
    return this.matriculaService.findDisciplinasByAluno(+id);
  }

  @Get('disciplinas/:id/alunos')
  findAlunosByDisciplina(@Param('id') id: string) {
    return this.matriculaService.findAlunosByDisciplina(+id);
  }

  @Get('cursos/:id/alunos')
  findAlunosByCurso(@Param('id') id: string) {
    return this.matriculaService.findAlunosByCurso(+id);
  }
}
