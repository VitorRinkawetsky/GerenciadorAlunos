import { CursoController } from './curso.controller';
import { CursoService } from './curso.service';

describe('CursoController', () => {
  let controller: CursoController;
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
    controller = new CursoController(service as unknown as CursoService);
  });

  it('deve delegar criacao ao service', () => {
    const dto = {
      nome: 'Sistemas de Informacao',
      descricao: 'Curso focado em tecnologia da informacao.',
    };
    const curso = { id: 1, ...dto };
    service.create.mockReturnValue(curso);

    expect(controller.create(dto)).toBe(curso);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('deve delegar listagem paginada ao service', () => {
    const result = {
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
    service.findAll.mockReturnValue(result);

    expect(controller.findAll({ page: 1, limit: 10, nome: 'sistemas' })).toBe(
      result,
    );
    expect(service.findAll).toHaveBeenCalledWith(1, 10, 'sistemas');
  });

  it('deve delegar busca, atualizacao e exclusao ao service', () => {
    const curso = {
      id: 1,
      nome: 'Sistemas',
      descricao: 'Curso focado em tecnologia.',
    };
    service.findOne.mockReturnValue(curso);
    service.update.mockReturnValue({ ...curso, nome: 'Sistemas Atualizado' });
    service.remove.mockReturnValue(undefined);

    expect(controller.findOne(1)).toBe(curso);
    expect(controller.update(1, { nome: 'Sistemas Atualizado' })).toEqual({
      ...curso,
      nome: 'Sistemas Atualizado',
    });
    expect(controller.remove(1)).toBeUndefined();
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(service.update).toHaveBeenCalledWith(1, {
      nome: 'Sistemas Atualizado',
    });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
