import { ConflictException, NotFoundException } from '@nestjs/common';
import { CursoService } from './curso.service';

describe('CursoService', () => {
  let service: CursoService;

  beforeEach(() => {
    service = new CursoService();
  });

  it('deve criar um curso', () => {
    const curso = service.create({
      nome: 'Engenharia de Software',
      descricao: 'Curso focado em desenvolvimento de sistemas.',
    });

    expect(curso).toMatchObject({
      id: 1,
      nome: 'Engenharia de Software',
      descricao: 'Curso focado em desenvolvimento de sistemas.',
    });
    expect(curso.createdAt).toBeInstanceOf(Date);
    expect(curso.updatedAt).toBeInstanceOf(Date);
  });

  it('deve buscar um curso por id', () => {
    const curso = service.create({
      nome: 'Sistemas de Informacao',
      descricao: 'Curso focado em tecnologia da informacao.',
    });

    expect(service.findOne(curso.id)).toBe(curso);
  });

  it('deve listar cursos com paginacao e filtro por nome', () => {
    service.create({
      nome: 'Sistemas de Informacao',
      descricao: 'Curso focado em tecnologia da informacao.',
    });
    service.create({
      nome: 'Engenharia de Software',
      descricao: 'Curso focado em desenvolvimento de sistemas.',
    });
    service.create({
      nome: 'Administracao',
      descricao: 'Curso focado em gestao empresarial.',
    });

    const result = service.findAll(1, 1, 'software');

    expect(result.data).toHaveLength(1);
    expect(result.data[0].nome).toBe('Engenharia de Software');
    expect(result.meta).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('deve atualizar um curso', () => {
    const curso = service.create({
      nome: 'Sistemas',
      descricao: 'Curso focado em tecnologia da informacao.',
    });

    const updated = service.update(curso.id, {
      nome: 'Sistemas de Informacao',
      descricao: 'Curso atualizado com nova descricao.',
    });

    expect(updated.nome).toBe('Sistemas de Informacao');
    expect(updated.descricao).toBe('Curso atualizado com nova descricao.');
  });

  it('deve excluir um curso', () => {
    const curso = service.create({
      nome: 'Administracao',
      descricao: 'Curso focado em gestao empresarial.',
    });

    service.remove(curso.id);

    expect(() => service.findOne(curso.id)).toThrow(NotFoundException);
  });

  it('deve rejeitar curso com nome duplicado', () => {
    service.create({
      nome: 'Sistemas de Informacao',
      descricao: 'Curso focado em tecnologia da informacao.',
    });

    expect(() =>
      service.create({
        nome: 'sistemas de informacao',
        descricao: 'Outro curso com o mesmo nome.',
      }),
    ).toThrow(ConflictException);
  });

  it('deve rejeitar atualizacao para nome ja usado por outro curso', () => {
    const sistemas = service.create({
      nome: 'Sistemas de Informacao',
      descricao: 'Curso focado em tecnologia da informacao.',
    });
    service.create({
      nome: 'Engenharia de Software',
      descricao: 'Curso focado em desenvolvimento de sistemas.',
    });

    expect(() =>
      service.update(sistemas.id, { nome: 'engenharia de software' }),
    ).toThrow(ConflictException);
  });

  it('deve retornar erro ao buscar, atualizar ou excluir curso inexistente', () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
    expect(() => service.update(999, { nome: 'Inexistente' })).toThrow(
      NotFoundException,
    );
    expect(() => service.remove(999)).toThrow(NotFoundException);
  });
});
