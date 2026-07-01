import { MatriculaController } from './matricula.controller';
import { MatriculaService } from './matricula.service';

describe('MatriculaController', () => {
  let controller: MatriculaController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findDisciplinasByAluno: jest.Mock;
    findAlunosByDisciplina: jest.Mock;
    findAlunosByCurso: jest.Mock;
  };

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findDisciplinasByAluno: jest.fn(),
      findAlunosByDisciplina: jest.fn(),
      findAlunosByCurso: jest.fn(),
    };
    controller = new MatriculaController(service as unknown as MatriculaService);
  });

  it('deve delegar criacao ao service', () => {
    const dto = { alunoId: 1, disciplinaId: 2 };
    const matricula = { id: 1, ...dto };
    service.create.mockReturnValue(matricula);

    expect(controller.create(dto)).toBe(matricula);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('deve delegar listagem e buscas ao service', () => {
    const matricula = { id: 1, alunoId: 1, disciplinaId: 2 };
    service.findAll.mockReturnValue([matricula]);
    service.findOne.mockReturnValue(matricula);
    service.findDisciplinasByAluno.mockReturnValue([matricula]);
    service.findAlunosByDisciplina.mockReturnValue([matricula]);
    service.findAlunosByCurso.mockReturnValue([]);

    expect(controller.findAll()).toEqual([matricula]);
    expect(controller.findOne('1')).toBe(matricula);
    expect(controller.findDisciplinasByAluno('1')).toEqual([matricula]);
    expect(controller.findAlunosByDisciplina('2')).toEqual([matricula]);
    expect(controller.findAlunosByCurso('3')).toEqual([]);

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(service.findDisciplinasByAluno).toHaveBeenCalledWith(1);
    expect(service.findAlunosByDisciplina).toHaveBeenCalledWith(2);
    expect(service.findAlunosByCurso).toHaveBeenCalledWith(3);
  });
});
