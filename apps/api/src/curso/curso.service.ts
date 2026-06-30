import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Curso } from './entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class CursoService {
  private cursos: Curso[] = [];
  private nextId = 1;

  create(dto: CreateCursoDto): Curso {
    const exists = this.cursos.find(
      (c) => c.nome.toLowerCase() === dto.nome.toLowerCase(),
    );
    if (exists) {
      throw new ConflictException('Já existe um curso com este nome');
    }

    const curso: Curso = {
      id: this.nextId++,
      nome: dto.nome,
      descricao: dto.descricao,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cursos.push(curso);
    return curso;
  }

  findAll(
    page = 1,
    limit = 10,
    nome?: string,
  ): PaginatedResult<Curso> {
    let filtered = this.cursos;
    if (nome) {
      filtered = filtered.filter((c) =>
        c.nome.toLowerCase().includes(nome.toLowerCase()),
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      meta: { page, limit, total, totalPages },
    };
  }

  findOne(id: number): Curso {
    const curso = this.cursos.find((c) => c.id === id);
    if (!curso) {
      throw new NotFoundException(`Curso com id ${id} não encontrado`);
    }
    return curso;
  }

  update(id: number, dto: UpdateCursoDto): Curso {
    const curso = this.findOne(id);

    if (dto.nome) {
      const exists = this.cursos.find(
        (c) =>
          c.nome.toLowerCase() === dto.nome!.toLowerCase() && c.id !== id,
      );
      if (exists) {
        throw new ConflictException('Já existe um curso com este nome');
      }
      curso.nome = dto.nome;
    }
    if (dto.descricao !== undefined) {
      curso.descricao = dto.descricao;
    }
    curso.updatedAt = new Date();
    return curso;
  }

  remove(id: number): void {
    const index = this.cursos.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Curso com id ${id} não encontrado`);
    }
    this.cursos.splice(index, 1);
  }
}
