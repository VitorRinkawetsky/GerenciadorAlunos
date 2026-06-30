import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Aluno } from './entities/aluno.entity';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { CursoService } from '../curso/curso.service';

@Injectable()
export class AlunoService {
  private alunos: Aluno[] = [];
  private nextId = 1;

  constructor(private readonly cursoService: CursoService) {}

  create(dto: CreateAlunoDto): Aluno {
    const emailExists = this.alunos.find(
      (a) => a.email.toLowerCase() === dto.email.toLowerCase(),
    );
    if (emailExists) {
      throw new ConflictException('Já existe um aluno com este email');
    }

    const matriculaExists = this.alunos.find(
      (a) => a.matricula.toLowerCase() === dto.matricula.toLowerCase(),
    );
    if (matriculaExists) {
      throw new ConflictException('Já existe um aluno com esta matrícula');
    }

    try {
      this.cursoService.findOne(dto.cursoId);
    } catch {
      throw new BadRequestException(
        `Curso com id ${dto.cursoId} não encontrado`,
      );
    }

    const aluno: Aluno = {
      id: this.nextId++,
      nome: dto.nome,
      email: dto.email,
      matricula: dto.matricula,
      cursoId: dto.cursoId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.alunos.push(aluno);
    return aluno;
  }

  findAll(
    page = 1,
    limit = 10,
    nome?: string,
    cursoId?: number,
  ): PaginatedResult<Aluno> {
    let filtered = this.alunos;
    if (nome) {
      filtered = filtered.filter((a) =>
        a.nome.toLowerCase().includes(nome.toLowerCase()),
      );
    }
    if (cursoId) {
      filtered = filtered.filter((a) => a.cursoId === cursoId);
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

  findOne(id: number): Aluno {
    const aluno = this.alunos.find((a) => a.id === id);
    if (!aluno) {
      throw new NotFoundException(`Aluno com id ${id} não encontrado`);
    }
    return aluno;
  }

  update(id: number, dto: UpdateAlunoDto): Aluno {
    const aluno = this.findOne(id);

    if (dto.email) {
      const emailExists = this.alunos.find(
        (a) =>
          a.email.toLowerCase() === dto.email!.toLowerCase() && a.id !== id,
      );
      if (emailExists) {
        throw new ConflictException('Já existe um aluno com este email');
      }
      aluno.email = dto.email;
    }

    if (dto.matricula) {
      const matriculaExists = this.alunos.find(
        (a) =>
          a.matricula.toLowerCase() === dto.matricula!.toLowerCase() &&
          a.id !== id,
      );
      if (matriculaExists) {
        throw new ConflictException('Já existe um aluno com esta matrícula');
      }
      aluno.matricula = dto.matricula;
    }

    if (dto.cursoId) {
      try {
        this.cursoService.findOne(dto.cursoId);
      } catch {
        throw new BadRequestException(
          `Curso com id ${dto.cursoId} não encontrado`,
        );
      }
      aluno.cursoId = dto.cursoId;
    }

    if (dto.nome !== undefined) {
      aluno.nome = dto.nome;
    }
    aluno.updatedAt = new Date();
    return aluno;
  }

  remove(id: number): void {
    const index = this.alunos.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new NotFoundException(`Aluno com id ${id} não encontrado`);
    }
    this.alunos.splice(index, 1);
  }
}
