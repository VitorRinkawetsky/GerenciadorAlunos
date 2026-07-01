import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CreateAlunoDto } from '../../aluno/dto/create-aluno.dto';
import { QueryAlunoDto } from '../../aluno/dto/query-aluno.dto';
import { UpdateAlunoDto } from '../../aluno/dto/update-aluno.dto';
import { CreateCursoDto } from '../../curso/dto/create-curso.dto';
import { QueryCursoDto } from '../../curso/dto/query-curso.dto';
import { UpdateCursoDto } from '../../curso/dto/update-curso.dto';
import { CreateDisciplinaDto } from '../../disciplina/dto/create-disciplina.dto';
import { CreateMatriculaDto } from '../../matricula/dto/create-matricula.dto';
import { QueryDisciplinaDto } from '../../disciplina/dto/query-disciplina.dto';
import { UpdateDisciplinaDto } from '../../disciplina/dto/update-disciplina.dto';
import { PaginationDto } from './pagination.dto';

type DtoClass<T extends object> = new () => T;

const validateDto = async <T extends object>(
  dto: DtoClass<T>,
  payload: Record<string, unknown>,
): Promise<ValidationError[]> => validate(plainToInstance(dto, payload));

const properties = (errors: ValidationError[]) =>
  errors.map((error) => error.property);

describe('DTO validations', () => {
  it('deve validar campos obrigatorios de curso', async () => {
    const errors = await validateDto(CreateCursoDto, {});

    expect(properties(errors)).toEqual(
      expect.arrayContaining(['nome', 'descricao']),
    );
  });

  it('deve validar campos obrigatorios de aluno', async () => {
    const errors = await validateDto(CreateAlunoDto, {});

    expect(properties(errors)).toEqual(
      expect.arrayContaining(['nome', 'email', 'matricula', 'cursoId']),
    );
  });

  it('deve validar campos obrigatorios de disciplina', async () => {
    const errors = await validateDto(CreateDisciplinaDto, {});

    expect(properties(errors)).toEqual(
      expect.arrayContaining([
        'nome',
        'codigo',
        'cargaHoraria',
        'limiteVagas',
        'cursoId',
      ]),
    );
  });

  it('deve validar campos obrigatorios de matricula', async () => {
    const errors = await validateDto(CreateMatriculaDto, {});

    expect(properties(errors)).toEqual(
      expect.arrayContaining(['alunoId', 'disciplinaId']),
    );
  });

  it('deve rejeitar formatos e limites invalidos', async () => {
    const alunoErrors = await validateDto(CreateAlunoDto, {
      nome: 'An',
      email: 'email-invalido',
      matricula: '1',
      cursoId: -1,
    });
    const disciplinaErrors = await validateDto(CreateDisciplinaDto, {
      nome: 'BD',
      codigo: 'B',
      cargaHoraria: 401,
      limiteVagas: 501,
      cursoId: 0,
      prerequisitoIds: [1, 1],
      ativa: 'sim',
    });
    const matriculaErrors = await validateDto(CreateMatriculaDto, {
      alunoId: 0,
      disciplinaId: -1,
    });

    expect(properties(alunoErrors)).toEqual(
      expect.arrayContaining(['nome', 'email', 'matricula', 'cursoId']),
    );
    expect(properties(disciplinaErrors)).toEqual(
      expect.arrayContaining([
        'nome',
        'codigo',
        'cargaHoraria',
        'limiteVagas',
        'cursoId',
        'prerequisitoIds',
        'ativa',
      ]),
    );
    expect(properties(matriculaErrors)).toEqual(
      expect.arrayContaining(['alunoId', 'disciplinaId']),
    );
  });

  it('deve validar DTOs de atualizacao', async () => {
    const cursoErrors = await validateDto(UpdateCursoDto, {
      nome: 'SI',
      descricao: 'curta',
    });
    const alunoErrors = await validateDto(UpdateAlunoDto, {
      nome: 'An',
      email: 'email-invalido',
      matricula: '1',
      cursoId: 0,
    });
    const disciplinaErrors = await validateDto(UpdateDisciplinaDto, {
      nome: 'BD',
      codigo: 'B',
      cargaHoraria: 401,
      limiteVagas: 501,
      cursoId: 0,
      prerequisitoIds: [1, 1],
      ativa: 'sim',
    });

    expect(properties(cursoErrors)).toEqual(
      expect.arrayContaining(['nome', 'descricao']),
    );
    expect(properties(alunoErrors)).toEqual(
      expect.arrayContaining(['nome', 'email', 'matricula', 'cursoId']),
    );
    expect(properties(disciplinaErrors)).toEqual(
      expect.arrayContaining([
        'nome',
        'codigo',
        'cargaHoraria',
        'limiteVagas',
        'cursoId',
        'prerequisitoIds',
        'ativa',
      ]),
    );
  });

  it('deve validar DTOs de query e paginacao', async () => {
    const paginationErrors = await validateDto(PaginationDto, {
      page: 0,
      limit: 101,
    });
    const cursoErrors = await validateDto(QueryCursoDto, {
      page: 1,
      limit: 10,
      nome: 123,
    });
    const alunoErrors = await validateDto(QueryAlunoDto, {
      page: 1,
      limit: 10,
      nome: 123,
      cursoId: -1,
    });
    const disciplinaErrors = await validateDto(QueryDisciplinaDto, {
      page: 1,
      limit: 10,
      nome: 123,
      cursoId: -1,
      ativa: 'sim',
    });

    expect(properties(paginationErrors)).toEqual(
      expect.arrayContaining(['page', 'limit']),
    );
    expect(properties(cursoErrors)).toEqual(expect.arrayContaining(['nome']));
    expect(properties(alunoErrors)).toEqual(
      expect.arrayContaining(['nome', 'cursoId']),
    );
    expect(properties(disciplinaErrors)).toEqual(
      expect.arrayContaining(['nome', 'cursoId']),
    );
  });

  it('deve aceitar DTOs validos', async () => {
    await expect(
      validateDto(CreateCursoDto, {
        nome: 'Sistemas de Informacao',
        descricao: 'Curso focado em tecnologia da informacao.',
      }),
    ).resolves.toHaveLength(0);
    await expect(
      validateDto(QueryDisciplinaDto, {
        page: 1,
        limit: 10,
        nome: 'algoritmos',
        cursoId: 1,
        ativa: true,
      }),
    ).resolves.toHaveLength(0);
  });
});
