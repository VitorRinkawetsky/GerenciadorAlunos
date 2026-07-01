import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CursoService } from '../curso/curso.service';
import { AlunoService } from './aluno.service';

describe('AlunoService', () => {
  let cursoService: CursoService;
  let service: AlunoService;

  beforeEach(() => {
    cursoService = new CursoService();
    service = new AlunoService(cursoService);
  });

  const criarCurso = (nome = 'Sistemas de Informacao') =>
    cursoService.create({
      nome,
      descricao: 'Curso focado em tecnologia da informacao.',
    });

  it('deve criar um aluno vinculado a um curso existente', () => {
    const curso = criarCurso();

    const aluno = service.create({
      nome: 'Ana Silva',
      email: 'ana.silva@example.com',
      matricula: 'MAT001',
      cursoId: curso.id,
    });

    expect(aluno).toMatchObject({
      id: 1,
      nome: 'Ana Silva',
      email: 'ana.silva@example.com',
      matricula: 'MAT001',
      cursoId: curso.id,
    });
  });

  it('deve buscar um aluno por id', () => {
    const curso = criarCurso();
    const aluno = service.create({
      nome: 'Bruno Lima',
      email: 'bruno.lima@example.com',
      matricula: 'MAT002',
      cursoId: curso.id,
    });

    expect(service.findOne(aluno.id)).toBe(aluno);
  });

  it('deve listar alunos com paginacao, filtro por nome e curso', () => {
    const cursoSistemas = criarCurso('Sistemas de Informacao');
    const cursoDireito = criarCurso('Direito');

    service.create({
      nome: 'Ana Silva',
      email: 'ana.silva@example.com',
      matricula: 'MAT001',
      cursoId: cursoSistemas.id,
    });
    service.create({
      nome: 'Ana Paula',
      email: 'ana.paula@example.com',
      matricula: 'MAT002',
      cursoId: cursoDireito.id,
    });
    service.create({
      nome: 'Carlos Souza',
      email: 'carlos.souza@example.com',
      matricula: 'MAT003',
      cursoId: cursoSistemas.id,
    });

    const result = service.findAll(1, 1, 'ana', cursoSistemas.id);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      nome: 'Ana Silva',
      cursoId: cursoSistemas.id,
    });
    expect(result.meta).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('deve atualizar um aluno e trocar o curso', () => {
    const cursoAtual = criarCurso('Sistemas de Informacao');
    const novoCurso = criarCurso('Engenharia de Software');
    const aluno = service.create({
      nome: 'Daniel Costa',
      email: 'daniel.costa@example.com',
      matricula: 'MAT004',
      cursoId: cursoAtual.id,
    });

    const updated = service.update(aluno.id, {
      nome: 'Daniel Costa Atualizado',
      email: 'daniel.atualizado@example.com',
      matricula: 'MAT004A',
      cursoId: novoCurso.id,
    });

    expect(updated).toMatchObject({
      nome: 'Daniel Costa Atualizado',
      email: 'daniel.atualizado@example.com',
      matricula: 'MAT004A',
      cursoId: novoCurso.id,
    });
  });

  it('deve excluir um aluno', () => {
    const curso = criarCurso();
    const aluno = service.create({
      nome: 'Elaine Martins',
      email: 'elaine.martins@example.com',
      matricula: 'MAT005',
      cursoId: curso.id,
    });

    service.remove(aluno.id);

    expect(() => service.findOne(aluno.id)).toThrow(NotFoundException);
  });

  it('deve rejeitar aluno vinculado a curso inexistente', () => {
    expect(() =>
      service.create({
        nome: 'Felipe Rocha',
        email: 'felipe.rocha@example.com',
        matricula: 'MAT006',
        cursoId: 999,
      }),
    ).toThrow(BadRequestException);
  });

  it('deve rejeitar email e matricula duplicados', () => {
    const curso = criarCurso();
    service.create({
      nome: 'Gabriela Alves',
      email: 'gabriela.alves@example.com',
      matricula: 'MAT007',
      cursoId: curso.id,
    });

    expect(() =>
      service.create({
        nome: 'Outra Gabriela',
        email: 'GABRIELA.ALVES@example.com',
        matricula: 'MAT008',
        cursoId: curso.id,
      }),
    ).toThrow(ConflictException);

    expect(() =>
      service.create({
        nome: 'Helena Dias',
        email: 'helena.dias@example.com',
        matricula: 'mat007',
        cursoId: curso.id,
      }),
    ).toThrow(ConflictException);
  });

  it('deve rejeitar atualizacao com email, matricula ou curso invalidos', () => {
    const curso = criarCurso();
    const ana = service.create({
      nome: 'Ana Silva',
      email: 'ana.silva@example.com',
      matricula: 'MAT009',
      cursoId: curso.id,
    });
    service.create({
      nome: 'Bruno Lima',
      email: 'bruno.lima@example.com',
      matricula: 'MAT010',
      cursoId: curso.id,
    });

    expect(() =>
      service.update(ana.id, { email: 'BRUNO.LIMA@example.com' }),
    ).toThrow(ConflictException);
    expect(() => service.update(ana.id, { matricula: 'mat010' })).toThrow(
      ConflictException,
    );
    expect(() => service.update(ana.id, { cursoId: 999 })).toThrow(
      BadRequestException,
    );
  });

  it('deve retornar erro ao buscar, atualizar ou excluir aluno inexistente', () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
    expect(() => service.update(999, { nome: 'Inexistente' })).toThrow(
      NotFoundException,
    );
    expect(() => service.remove(999)).toThrow(NotFoundException);
  });
});
