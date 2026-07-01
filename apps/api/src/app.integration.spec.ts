import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

type IdResponse = { id: number };
type CursoResponse = IdResponse & { nome: string };
type AlunoResponse = IdResponse & { nome: string; cursoId: number };
type DisciplinaResponse = IdResponse & { codigo: string };
type PaginatedCursoResponse = {
  data: CursoResponse[];
  meta: { total: number };
};
type ErrorResponse = {
  statusCode: number;
  error?: string;
  path: string;
};

describe('API integration (Supertest)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('deve executar fluxo HTTP de cursos', async () => {
    const created = await request(app.getHttpServer())
      .post('/cursos')
      .send({
        nome: 'Sistemas de Informacao',
        descricao: 'Curso focado em tecnologia da informacao.',
      })
      .expect(201);

    const createdBody = created.body as CursoResponse;
    const cursoId = createdBody.id;
    expect(createdBody).toMatchObject({
      id: cursoId,
      nome: 'Sistemas de Informacao',
    });

    await request(app.getHttpServer())
      .get(`/cursos/${cursoId}`)
      .expect(200)
      .expect((response) => {
        const body = response.body as CursoResponse;
        expect(body.nome).toBe('Sistemas de Informacao');
      });

    await request(app.getHttpServer())
      .get('/cursos?page=1&limit=10&nome=sistemas')
      .expect(200)
      .expect((response) => {
        const body = response.body as PaginatedCursoResponse;
        expect(body.meta.total).toBe(1);
        expect(body.data[0].id).toBe(cursoId);
      });

    await request(app.getHttpServer())
      .patch(`/cursos/${cursoId}`)
      .send({ nome: 'Sistemas Atualizado' })
      .expect(200)
      .expect((response) => {
        const body = response.body as CursoResponse;
        expect(body.nome).toBe('Sistemas Atualizado');
      });

    await request(app.getHttpServer()).delete(`/cursos/${cursoId}`).expect(200);
    await request(app.getHttpServer()).get(`/cursos/${cursoId}`).expect(404);
  });

  it('deve validar payloads e formatar erros esperados', async () => {
    await request(app.getHttpServer())
      .post('/cursos')
      .send({ nome: 'SI' })
      .expect(400)
      .expect((response) => {
        const body = response.body as ErrorResponse;
        expect(body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            error: 'Bad Request',
            path: '/cursos',
          }),
        );
      });

    await request(app.getHttpServer())
      .post('/alunos')
      .send({
        nome: 'Ana Silva',
        email: 'ana.silva@example.com',
        matricula: 'MAT001',
        cursoId: 999,
      })
      .expect(400);
  });

  it('deve executar fluxo integrado entre curso, aluno e disciplina', async () => {
    const curso = await request(app.getHttpServer())
      .post('/cursos')
      .send({
        nome: 'Engenharia de Software',
        descricao: 'Curso focado em desenvolvimento de sistemas.',
      })
      .expect(201);

    const cursoBody = curso.body as IdResponse;
    const aluno = await request(app.getHttpServer())
      .post('/alunos')
      .send({
        nome: 'Bruno Lima',
        email: 'bruno.lima@example.com',
        matricula: 'MAT002',
        cursoId: cursoBody.id,
      })
      .expect(201);
    const alunoBody = aluno.body as AlunoResponse;

    expect(alunoBody).toMatchObject({
      nome: 'Bruno Lima',
      cursoId: cursoBody.id,
    });

    const algoritmos = await request(app.getHttpServer())
      .post('/disciplinas')
      .send({
        nome: 'Algoritmos',
        codigo: 'ALG001',
        cargaHoraria: 80,
        limiteVagas: 40,
        cursoId: cursoBody.id,
      })
      .expect(201);
    const algoritmosBody = algoritmos.body as DisciplinaResponse;

    const estrutura = await request(app.getHttpServer())
      .post('/disciplinas')
      .send({
        nome: 'Estrutura de Dados',
        codigo: 'ED001',
        cargaHoraria: 80,
        limiteVagas: 40,
        cursoId: cursoBody.id,
        prerequisitoIds: [algoritmosBody.id],
      })
      .expect(201);
    const estruturaBody = estrutura.body as DisciplinaResponse;

    await request(app.getHttpServer())
      .get(`/disciplinas/${estruturaBody.id}/prerequisitos`)
      .expect(200)
      .expect((response) => {
        const body = response.body as DisciplinaResponse[];
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({
          id: algoritmosBody.id,
          codigo: 'ALG001',
        });
      });
  });
});
