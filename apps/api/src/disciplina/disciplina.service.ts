import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Disciplina } from './entities/disciplina.entity';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { CursoService } from '../curso/curso.service';

@Injectable()
export class DisciplinaService {
  private disciplinas: Disciplina[] = [];
  private nextId = 1;

  constructor(private readonly cursoService: CursoService) {}

  create(dto: CreateDisciplinaDto) {
    try {
      this.cursoService.findOne(dto.cursoId);
    } catch {
      throw new BadRequestException(
        `Curso com id ${dto.cursoId} não encontrado`,
      );
    }

    const codigoExiste = this.disciplinas.find(
      (d) => d.codigo.toLowerCase() === dto.codigo.toLowerCase(),
    );
    if (codigoExiste) {
      throw new ConflictException('Já existe uma disciplina com este código');
    }

    const prerequisitoIds = dto.prerequisitoIds ?? [];
    if (prerequisitoIds.length) {
      this.assertPrerequisitosExistem(prerequisitoIds);
    }

    const disciplina: Disciplina = {
      id: this.nextId++,
      nome: dto.nome,
      codigo: dto.codigo,
      cargaHoraria: dto.cargaHoraria,
      limiteVagas: dto.limiteVagas,
      vagasOcupadas: 0,
      ativa: dto.ativa ?? true,
      cursoId: dto.cursoId,
      prerequisitoIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.disciplinas.push(disciplina);
    return this.toResponse(disciplina);
  }

  findAll(
    page = 1,
    limit = 10,
    nome?: string,
    cursoId?: number,
    ativa?: boolean,
  ): PaginatedResult<ReturnType<DisciplinaService['toResponse']>> {
    let filtered = this.disciplinas;

    if (nome) {
      filtered = filtered.filter((d) =>
        d.nome.toLowerCase().includes(nome.toLowerCase()),
      );
    }
    if (cursoId !== undefined) {
      filtered = filtered.filter((d) => d.cursoId === cursoId);
    }
    if (ativa !== undefined) {
      filtered = filtered.filter((d) => d.ativa === ativa);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit).map((d) => this.toResponse(d));

    return { data, meta: { page, limit, total, totalPages } };
  }

  findOne(id: number): Disciplina {
    const disciplina = this.disciplinas.find((d) => d.id === id);
    if (!disciplina) {
      throw new NotFoundException(`Disciplina com id ${id} não encontrada`);
    }
    return disciplina;
  }

  findOneResponse(id: number) {
    return this.toResponse(this.findOne(id));
  }

  update(id: number, dto: UpdateDisciplinaDto) {
    const disciplina = this.findOne(id);

    if (dto.cursoId !== undefined) {
      try {
        this.cursoService.findOne(dto.cursoId);
      } catch {
        throw new BadRequestException(
          `Curso com id ${dto.cursoId} não encontrado`,
        );
      }
      disciplina.cursoId = dto.cursoId;
    }

    if (dto.codigo !== undefined) {
      const codigoExiste = this.disciplinas.find(
        (d) =>
          d.codigo.toLowerCase() === dto.codigo!.toLowerCase() && d.id !== id,
      );
      if (codigoExiste) {
        throw new ConflictException('Já existe uma disciplina com este código');
      }
      disciplina.codigo = dto.codigo;
    }

    if (dto.prerequisitoIds !== undefined) {
      if (dto.prerequisitoIds.includes(id)) {
        throw new BadRequestException(
          'Uma disciplina não pode ser pré-requisito de si mesma',
        );
      }
      if (dto.prerequisitoIds.length) {
        this.assertPrerequisitosExistem(dto.prerequisitoIds);
        this.assertSemCiclo(id, dto.prerequisitoIds);
      }
      disciplina.prerequisitoIds = dto.prerequisitoIds;
    }

    if (dto.limiteVagas !== undefined) {
      if (dto.limiteVagas < disciplina.vagasOcupadas) {
        throw new BadRequestException(
          `Não é possível reduzir o limite de vagas para ${dto.limiteVagas}: ` +
            `já existem ${disciplina.vagasOcupadas} aluno(s) matriculado(s)`,
        );
      }
      disciplina.limiteVagas = dto.limiteVagas;
    }

    if (dto.nome !== undefined) disciplina.nome = dto.nome;
    if (dto.cargaHoraria !== undefined) disciplina.cargaHoraria = dto.cargaHoraria;
    if (dto.ativa !== undefined) disciplina.ativa = dto.ativa;

    disciplina.updatedAt = new Date();
    return this.toResponse(disciplina);
  }

  remove(id: number): void {
    const disciplina = this.findOne(id);

    if (disciplina.vagasOcupadas > 0) {
      throw new ConflictException(
        'Não é possível excluir uma disciplina com alunos matriculados',
      );
    }

    const dependente = this.disciplinas.find(
      (d) => d.id !== id && d.prerequisitoIds.includes(id),
    );
    if (dependente) {
      throw new ConflictException(
        `Não é possível excluir: esta disciplina é pré-requisito de "${dependente.nome}"`,
      );
    }

    const index = this.disciplinas.findIndex((d) => d.id === id);
    this.disciplinas.splice(index, 1);
  }

  // Para a Pessoa 4 usar no MatriculaService
  ocuparVaga(id: number): Disciplina {
    const disciplina = this.findOne(id);
    if (!disciplina.ativa) {
      throw new BadRequestException(
        `A disciplina "${disciplina.nome}" está inativa`,
      );
    }
    if (disciplina.vagasOcupadas >= disciplina.limiteVagas) {
      throw new ConflictException(
        `A disciplina "${disciplina.nome}" não possui vagas disponíveis`,
      );
    }
    disciplina.vagasOcupadas += 1;
    disciplina.updatedAt = new Date();
    return disciplina;
  }

  liberarVaga(id: number): Disciplina {
    const disciplina = this.findOne(id);
    if (disciplina.vagasOcupadas > 0) {
      disciplina.vagasOcupadas -= 1;
      disciplina.updatedAt = new Date();
    }
    return disciplina;
  }

  private assertPrerequisitosExistem(ids: number[]): void {
    for (const pid of ids) {
      if (!this.disciplinas.find((d) => d.id === pid)) {
        throw new BadRequestException(
          `Pré-requisito com id ${pid} não encontrado`,
        );
      }
    }
  }

  private assertSemCiclo(disciplinaId: number, novosPrereqIds: number[]): void {
    const visitados = new Set<number>(novosPrereqIds);
    let fronteira = [...novosPrereqIds];

    while (fronteira.length > 0) {
      const proximos: number[] = [];
      for (const pid of fronteira) {
        const prereq = this.disciplinas.find((d) => d.id === pid);
        if (!prereq) continue;
        for (const nextId of prereq.prerequisitoIds) {
          if (nextId === disciplinaId) {
            throw new BadRequestException(
              'Essa alteração criaria uma dependência circular entre disciplinas',
            );
          }
          if (!visitados.has(nextId)) {
            visitados.add(nextId);
            proximos.push(nextId);
          }
        }
      }
      fronteira = proximos;
    }
  }

  private toResponse(disciplina: Disciplina) {
    const { vagasOcupadas, ...resto } = disciplina;
    return {
      ...resto,
      vagasDisponiveis: disciplina.limiteVagas - vagasOcupadas,
    };
  }
}