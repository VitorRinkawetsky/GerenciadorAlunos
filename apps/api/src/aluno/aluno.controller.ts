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
import { AlunoService } from './aluno.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { QueryAlunoDto } from './dto/query-aluno.dto';
import { Aluno } from './entities/aluno.entity';
import type { PaginatedResult } from '../common/dto/pagination.dto';

@Controller('alunos')
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  @Post()
  create(@Body() dto: CreateAlunoDto): Aluno {
    return this.alunoService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryAlunoDto): PaginatedResult<Aluno> {
    return this.alunoService.findAll(
      query.page,
      query.limit,
      query.nome,
      query.cursoId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Aluno {
    return this.alunoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlunoDto,
  ): Aluno {
    return this.alunoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): void {
    return this.alunoService.remove(id);
  }
}
