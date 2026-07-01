import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CursoService } from '../curso/curso.service';
import { DisciplinaService } from './disciplina.service';

describe('DisciplinaService', () => {
  let cursoService: CursoService;
  let service: DisciplinaService;

  beforeEach(() => {
    cursoService = new CursoService();
    service = new DisciplinaService(cursoService);
  });

  const criarCurso = (nome = 'Sistemas de Informacao') =>
    cursoService.create({
      nome,
      descricao: 'Curso focado em tecnologia da informacao.',
    });

  const criarDisciplina = (
    cursoId: number,
    overrides: Partial<{
      nome: string;
      codigo: string;
      cargaHoraria: number;
      limiteVagas: number;
      prerequisitoIds: number[];
      ativa: boolean;
    }> = {},
  ) =>
    service.create({
      nome: overrides.nome ?? 'Algoritmos',
      codigo: overrides.codigo ?? 'ALG001',
      cargaHoraria: overrides.cargaHoraria ?? 80,
      limiteVagas: overrides.limiteVagas ?? 40,
      cursoId,
      prerequisitoIds: overrides.prerequisitoIds,
      ativa: overrides.ativa,
    });

  it('deve criar uma disciplina vinculada a um curso existente', () => {
    const curso = criarCurso();

    const disciplina = criarDisciplina(curso.id);

    expect(disciplina).toMatchObject({
      id: 1,
      nome: 'Algoritmos',
      codigo: 'ALG001',
      cargaHoraria: 80,
      limiteVagas: 40,
      ativa: true,
      cursoId: curso.id,
      prerequisitoIds: [],
      vagasDisponiveis: 40,
    });
    expect(disciplina).not.toHaveProperty('vagasOcupadas');
  });

  it('deve buscar uma disciplina por id', () => {
    const curso = criarCurso();
    const disciplina = criarDisciplina(curso.id);

    expect(service.findOneResponse(disciplina.id)).toMatchObject({
      id: disciplina.id,
      codigo: 'ALG001',
    });
  });

  it('deve listar disciplinas com paginacao e filtros', () => {
    const cursoSistemas = criarCurso('Sistemas de Informacao');
    const cursoDireito = criarCurso('Direito');

    criarDisciplina(cursoSistemas.id, {
      nome: 'Algoritmos',
      codigo: 'ALG001',
      ativa: true,
    });
    criarDisciplina(cursoSistemas.id, {
      nome: 'Banco de Dados',
      codigo: 'BD001',
      ativa: false,
    });
    criarDisciplina(cursoDireito.id, {
      nome: 'Direito Civil',
      codigo: 'DC001',
      ativa: true,
    });

    const result = service.findAll(1, 1, 'algoritmos', cursoSistemas.id, true);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      nome: 'Algoritmos',
      cursoId: cursoSistemas.id,
      ativa: true,
    });
    expect(result.meta).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('deve atualizar uma disciplina', () => {
    const curso = criarCurso();
    const disciplina = criarDisciplina(curso.id);

    const updated = service.update(disciplina.id, {
      nome: 'Algoritmos Avancados',
      codigo: 'ALG002',
      cargaHoraria: 100,
      limiteVagas: 45,
      ativa: false,
    });

    expect(updated).toMatchObject({
      nome: 'Algoritmos Avancados',
      codigo: 'ALG002',
      cargaHoraria: 100,
      limiteVagas: 45,
      ativa: false,
      vagasDisponiveis: 45,
    });
  });

  it('deve excluir uma disciplina', () => {
    const curso = criarCurso();
    const disciplina = criarDisciplina(curso.id);

    service.remove(disciplina.id);

    expect(() => service.findOne(disciplina.id)).toThrow(NotFoundException);
  });

  it('deve rejeitar disciplina vinculada a curso inexistente', () => {
    expect(() => criarDisciplina(999)).toThrow(BadRequestException);
  });

  it('deve rejeitar codigo duplicado', () => {
    const curso = criarCurso();
    criarDisciplina(curso.id, { codigo: 'ALG001' });

    expect(() =>
      criarDisciplina(curso.id, {
        nome: 'Algoritmos Repetido',
        codigo: 'alg001',
      }),
    ).toThrow(ConflictException);
  });

  it('deve validar regras de relacionamento de prerequisitos', () => {
    const curso = criarCurso();
    const algoritmos = criarDisciplina(curso.id, {
      nome: 'Algoritmos',
      codigo: 'ALG001',
    });
    const estrutura = criarDisciplina(curso.id, {
      nome: 'Estrutura de Dados',
      codigo: 'ED001',
      prerequisitoIds: [algoritmos.id],
    });

    expect(estrutura.prerequisitoIds).toEqual([algoritmos.id]);
    expect(() =>
      service.update(algoritmos.id, { prerequisitoIds: [estrutura.id] }),
    ).toThrow(BadRequestException);
    expect(() =>
      service.update(algoritmos.id, { prerequisitoIds: [algoritmos.id] }),
    ).toThrow(BadRequestException);
    expect(() =>
      service.update(algoritmos.id, { prerequisitoIds: [999] }),
    ).toThrow(BadRequestException);
    expect(() => service.remove(algoritmos.id)).toThrow(ConflictException);
  });

  it('deve atualizar curso, codigo e prerequisitos validos', () => {
    const cursoSistemas = criarCurso('Sistemas de Informacao');
    const cursoEngenharia = criarCurso('Engenharia de Software');
    const algoritmos = criarDisciplina(cursoSistemas.id, {
      nome: 'Algoritmos',
      codigo: 'ALG001',
    });
    const estrutura = criarDisciplina(cursoSistemas.id, {
      nome: 'Estrutura de Dados',
      codigo: 'ED001',
      prerequisitoIds: [algoritmos.id],
    });
    const banco = criarDisciplina(cursoSistemas.id, {
      nome: 'Banco de Dados',
      codigo: 'BD001',
      prerequisitoIds: [estrutura.id],
    });

    const updated = service.update(banco.id, {
      cursoId: cursoEngenharia.id,
      codigo: 'BD002',
      prerequisitoIds: [estrutura.id],
    });

    expect(updated).toMatchObject({
      cursoId: cursoEngenharia.id,
      codigo: 'BD002',
      prerequisitoIds: [estrutura.id],
    });

    const withoutPrerequisitos = service.update(banco.id, {
      prerequisitoIds: [],
    });

    expect(withoutPrerequisitos.prerequisitoIds).toEqual([]);
  });

  it('deve rejeitar atualizacao com curso ou codigo invalidos', () => {
    const curso = criarCurso();
    const algoritmos = criarDisciplina(curso.id, {
      nome: 'Algoritmos',
      codigo: 'ALG001',
    });
    criarDisciplina(curso.id, {
      nome: 'Estrutura de Dados',
      codigo: 'ED001',
    });

    expect(() => service.update(algoritmos.id, { cursoId: 999 })).toThrow(
      BadRequestException,
    );
    expect(() => service.update(algoritmos.id, { codigo: 'ed001' })).toThrow(
      ConflictException,
    );
  });

  it('deve controlar vagas e tratar erros esperados', () => {
    const curso = criarCurso();
    const disciplina = criarDisciplina(curso.id, {
      limiteVagas: 1,
    });

    service.ocuparVaga(disciplina.id);

    expect(service.findOneResponse(disciplina.id)).toMatchObject({
      vagasDisponiveis: 0,
    });
    expect(() => service.ocuparVaga(disciplina.id)).toThrow(ConflictException);
    expect(() => service.remove(disciplina.id)).toThrow(ConflictException);
    expect(() => service.update(disciplina.id, { limiteVagas: 0 })).toThrow(
      BadRequestException,
    );

    service.liberarVaga(disciplina.id);

    expect(service.findOneResponse(disciplina.id)).toMatchObject({
      vagasDisponiveis: 1,
    });
  });

  it('deve manter vagas ao liberar disciplina sem vagas ocupadas', () => {
    const curso = criarCurso();
    const disciplina = criarDisciplina(curso.id, {
      limiteVagas: 2,
    });

    service.liberarVaga(disciplina.id);

    expect(service.findOneResponse(disciplina.id)).toMatchObject({
      vagasDisponiveis: 2,
    });
  });

  it('deve rejeitar ocupacao de vaga em disciplina inativa', () => {
    const curso = criarCurso();
    const disciplina = criarDisciplina(curso.id, {
      ativa: false,
    });

    expect(() => service.ocuparVaga(disciplina.id)).toThrow(
      BadRequestException,
    );
  });

  it('deve retornar erro ao buscar, atualizar ou excluir disciplina inexistente', () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
    expect(() => service.update(999, { nome: 'Inexistente' })).toThrow(
      NotFoundException,
    );
    expect(() => service.remove(999)).toThrow(NotFoundException);
  });
});
