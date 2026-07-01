import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { Matricula } from './entities/matricula.entity';

@Injectable()
export class MatriculaService {
  private matriculas: Matricula[] = [];
  private nextId = 1;

  create(dto: CreateMatriculaDto): Matricula {
    const existe = this.matriculas.find(
      (m) =>
        m.alunoId === dto.alunoId &&
        m.disciplinaId === dto.disciplinaId,
    );

    if (existe) {
      throw new ConflictException(
        'Aluno já matriculado nesta disciplina',
      );
    }

    const matricula: Matricula = {
      id: this.nextId++,
      alunoId: dto.alunoId,
      disciplinaId: dto.disciplinaId,
      createdAt: new Date(),
    };

    this.matriculas.push(matricula);

    return matricula;
  }

  findAll(): Matricula[] {
    return this.matriculas;
  }

  findOne(id: number): Matricula {
    const matricula = this.matriculas.find((m) => m.id === id);

    if (!matricula) {
      throw new NotFoundException(
        `Matrícula com id ${id} não encontrada`,
      );
    }

    return matricula;
  }

  // GET /alunos/:id/disciplinas
  findDisciplinasByAluno(alunoId: number): Matricula[] {
    return this.matriculas.filter(
      (m) => m.alunoId === alunoId,
    );
  }

  // GET /disciplinas/:id/alunos
  findAlunosByDisciplina(disciplinaId: number): Matricula[] {
    return this.matriculas.filter(
      (m) => m.disciplinaId === disciplinaId,
    );
  }

  // GET /cursos/:id/alunos
  findAlunosByCurso(cursoId: number): Matricula[] {

    return [];
  }

  remove(id: number): void {
    const index = this.matriculas.findIndex(
      (m) => m.id === id,
    );

    if (index === -1) {
      throw new NotFoundException(
        `Matrícula com id ${id} não encontrada`,
      );
    }

    this.matriculas.splice(index, 1);
  }
}