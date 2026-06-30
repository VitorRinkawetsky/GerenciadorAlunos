import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CursoService } from './curso.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { QueryCursoDto } from './dto/query-curso.dto';
import { Curso } from './entities/curso.entity';
import type { PaginatedResult } from '../common/dto/pagination.dto';

@Controller('cursos')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Post()
  create(@Body() dto: CreateCursoDto): Curso {
    return this.cursoService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryCursoDto): PaginatedResult<Curso> {
    return this.cursoService.findAll(query.page, query.limit, query.nome);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Curso {
    return this.cursoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCursoDto,
  ): Curso {
    return this.cursoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): void {
    return this.cursoService.remove(id);
  }
}
