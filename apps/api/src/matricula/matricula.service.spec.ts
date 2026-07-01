import { ConflictException, NotFoundException } from '@nestjs/common';
import { MatriculaService } from './matricula.service';

describe('MatriculaService', () => {
  let service: MatriculaService;

  beforeEach(() => {
    service = new MatriculaService();
  });

  it('deve criar uma matricula', () => {
    const matricula = service.create({
      alunoId: 1,
      disciplinaId: 2,
    });

    expect(matricula).toMatchObject({
      id: 1,
      alunoId: 1,
      disciplinaId: 2,
    });
    expect(matricula.createdAt).toBeInstanceOf(Date);
  });

  it('deve buscar uma matricula por id', () => {
    const criada = service.create({
      alunoId: 1,
      disciplinaId: 2,
    });

    expect(service.findOne(criada.id)).toBe(criada);
  });

  it('deve listar matriculas', () => {
    service.create({ alunoId: 1, disciplinaId: 2 });
    service.create({ alunoId: 2, disciplinaId: 3 });

    expect(service.findAll()).toHaveLength(2);
  });

  it('deve filtrar disciplinas por aluno', () => {
    service.create({ alunoId: 1, disciplinaId: 2 });
    service.create({ alunoId: 1, disciplinaId: 3 });
    service.create({ alunoId: 2, disciplinaId: 4 });

    expect(service.findDisciplinasByAluno(1)).toHaveLength(2);
    expect(service.findDisciplinasByAluno(1)).toEqual([
      expect.objectContaining({ disciplinaId: 2 }),
      expect.objectContaining({ disciplinaId: 3 }),
    ]);
  });

  it('deve filtrar alunos por disciplina', () => {
    service.create({ alunoId: 1, disciplinaId: 2 });
    service.create({ alunoId: 2, disciplinaId: 2 });
    service.create({ alunoId: 3, disciplinaId: 4 });

    expect(service.findAlunosByDisciplina(2)).toHaveLength(2);
    expect(service.findAlunosByDisciplina(2)).toEqual([
      expect.objectContaining({ alunoId: 1 }),
      expect.objectContaining({ alunoId: 2 }),
    ]);
  });

  it('deve retornar array vazio para alunos por curso enquanto nao houver regra', () => {
    service.create({ alunoId: 1, disciplinaId: 2 });

    expect(service.findAlunosByCurso(1)).toEqual([]);
  });

  it('deve remover uma matricula', () => {
    const criada = service.create({ alunoId: 1, disciplinaId: 2 });

    service.remove(criada.id);

    expect(() => service.findOne(criada.id)).toThrow(NotFoundException);
  });

  it('deve rejeitar matricula duplicada e id inexistente', () => {
    service.create({ alunoId: 1, disciplinaId: 2 });

    expect(() => service.create({ alunoId: 1, disciplinaId: 2 })).toThrow(
      ConflictException,
    );
    expect(() => service.findOne(999)).toThrow(NotFoundException);
    expect(() => service.remove(999)).toThrow(NotFoundException);
  });
});
