import { AlunoController } from './aluno.controller';
import { AlunoService } from './aluno.service';

describe('AlunoController', () => {
  let controller: AlunoController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new AlunoController(service as unknown as AlunoService);
  });

  it('deve delegar criacao ao service', () => {
    const dto = {
      nome: 'Ana Silva',
      email: 'ana.silva@example.com',
      matricula: 'MAT001',
      cursoId: 1,
    };
    const aluno = { id: 1, ...dto };
    service.create.mockReturnValue(aluno);

    expect(controller.create(dto)).toBe(aluno);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('deve delegar listagem paginada com filtros ao service', () => {
    const result = {
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
    service.findAll.mockReturnValue(result);

    expect(
      controller.findAll({
        page: 1,
        limit: 10,
        nome: 'ana',
        cursoId: 2,
      }),
    ).toBe(result);
    expect(service.findAll).toHaveBeenCalledWith(1, 10, 'ana', 2);
  });

  it('deve delegar busca, atualizacao e exclusao ao service', () => {
    const aluno = {
      id: 1,
      nome: 'Ana Silva',
      email: 'ana.silva@example.com',
      matricula: 'MAT001',
      cursoId: 1,
    };
    service.findOne.mockReturnValue(aluno);
    service.update.mockReturnValue({ ...aluno, nome: 'Ana Atualizada' });
    service.remove.mockReturnValue(undefined);

    expect(controller.findOne(1)).toBe(aluno);
    expect(controller.update(1, { nome: 'Ana Atualizada' })).toEqual({
      ...aluno,
      nome: 'Ana Atualizada',
    });
    expect(controller.remove(1)).toBeUndefined();
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(service.update).toHaveBeenCalledWith(1, {
      nome: 'Ana Atualizada',
    });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
