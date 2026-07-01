import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/http-exception.filter';

type IdResponse = { id: number };
type CursoResponse = IdResponse & { nome: string };
type DisciplinaResponse = IdResponse & { codigo: string };
type PaginatedCursoResponse = {
  data: CursoResponse[];
  meta: { total: number };
};
type ErrorResponse = {
  statusCode: number;
  path: string;
};

describe('API (e2e)', () => {
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

  it('deve criar, listar, buscar, atualizar e excluir curso via HTTP', async () => {
    const created = await request(app.getHttpServer())
      .post('/cursos')
      .send({
        nome: 'Sistemas de Informacao',
        descricao: 'Curso focado em tecnologia da informacao.',
      })
      .expect(201);

    const createdBody = created.body as CursoResponse;
    const cursoId = createdBody.id;

    await request(app.getHttpServer())
      .get('/cursos?page=1&limit=10')
      .expect(200)
      .expect((response) => {
        const body = response.body as PaginatedCursoResponse;
        expect(body.meta.total).toBe(1);
        expect(body.data[0].id).toBe(cursoId);
      });

    await request(app.getHttpServer())
      .get(`/cursos/${cursoId}`)
      .expect(200)
      .expect((response) => {
        const body = response.body as CursoResponse;
        expect(body.nome).toBe('Sistemas de Informacao');
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

  it('deve validar erros e relacionamentos via HTTP', async () => {
    await request(app.getHttpServer())
      .post('/cursos')
      .send({ nome: 'SI' })
      .expect(400)
      .expect((response) => {
        const body = response.body as ErrorResponse;
        expect(body.statusCode).toBe(400);
        expect(body.path).toBe('/cursos');
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

  it('deve integrar curso, aluno e disciplina via HTTP', async () => {
    const curso = await request(app.getHttpServer())
      .post('/cursos')
      .send({
        nome: 'Engenharia de Software',
        descricao: 'Curso focado em desenvolvimento de sistemas.',
      })
      .expect(201);
    const cursoBody = curso.body as IdResponse;

    await request(app.getHttpServer())
      .post('/alunos')
      .send({
        nome: 'Bruno Lima',
        email: 'bruno.lima@example.com',
        matricula: 'MAT002',
        cursoId: cursoBody.id,
      })
      .expect(201);

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
        expect(body[0].id).toBe(algoritmosBody.id);
      });
  });
});
