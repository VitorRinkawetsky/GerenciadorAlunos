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
import { DisciplinaService } from './disciplina.service';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { QueryDisciplinaDto } from './dto/query-disciplina.dto';

@Controller('disciplinas')
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  @Post()
  create(@Body() dto: CreateDisciplinaDto) {
    return this.disciplinaService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryDisciplinaDto) {
    return this.disciplinaService.findAll(
      query.page,
      query.limit,
      query.nome,
      query.cursoId,
      query.ativa,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.disciplinaService.findOneResponse(id);
  }

  @Get(':id/prerequisitos')
  findPrerequisitos(@Param('id', ParseIntPipe) id: number) {
    const disciplina = this.disciplinaService.findOne(id);
    return disciplina.prerequisitoIds.map((pid) =>
      this.disciplinaService.findOneResponse(pid),
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDisciplinaDto,
  ) {
    return this.disciplinaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): void {
    return this.disciplinaService.remove(id);
  }
}
