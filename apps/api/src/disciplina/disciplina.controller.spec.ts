import { DisciplinaController } from './disciplina.controller';
import { DisciplinaService } from './disciplina.service';

describe('DisciplinaController', () => {
  let controller: DisciplinaController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findOneResponse: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findOneResponse: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new DisciplinaController(
      service as unknown as DisciplinaService,
    );
  });

  it('deve delegar criacao ao service', () => {
    const dto = {
      nome: 'Algoritmos',
      codigo: 'ALG001',
      cargaHoraria: 80,
      limiteVagas: 40,
      cursoId: 1,
    };
    const disciplina = { id: 1, ...dto, prerequisitoIds: [] };
    service.create.mockReturnValue(disciplina);

    expect(controller.create(dto)).toBe(disciplina);
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
        nome: 'algoritmos',
        cursoId: 1,
        ativa: true,
      }),
    ).toBe(result);
    expect(service.findAll).toHaveBeenCalledWith(1, 10, 'algoritmos', 1, true);
  });

  it('deve delegar busca, atualizacao e exclusao ao service', () => {
    const disciplina = {
      id: 1,
      nome: 'Algoritmos',
      codigo: 'ALG001',
      prerequisitoIds: [],
    };
    service.findOneResponse.mockReturnValue(disciplina);
    service.update.mockReturnValue({ ...disciplina, nome: 'Algoritmos II' });
    service.remove.mockReturnValue(undefined);

    expect(controller.findOne(1)).toBe(disciplina);
    expect(controller.update(1, { nome: 'Algoritmos II' })).toEqual({
      ...disciplina,
      nome: 'Algoritmos II',
    });
    expect(controller.remove(1)).toBeUndefined();
    expect(service.findOneResponse).toHaveBeenCalledWith(1);
    expect(service.update).toHaveBeenCalledWith(1, {
      nome: 'Algoritmos II',
    });
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('deve buscar prerequisitos da disciplina', () => {
    service.findOne.mockReturnValue({ id: 2, prerequisitoIds: [1] });
    service.findOneResponse.mockReturnValue({
      id: 1,
      nome: 'Algoritmos',
      codigo: 'ALG001',
    });

    expect(controller.findPrerequisitos(2)).toEqual([
      { id: 1, nome: 'Algoritmos', codigo: 'ALG001' },
    ]);
    expect(service.findOne).toHaveBeenCalledWith(2);
    expect(service.findOneResponse).toHaveBeenCalledWith(1);
  });
});
