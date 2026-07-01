# Gerenciador de Alunos API

API REST em NestJS para gerenciamento de cursos, alunos, disciplinas e matriculas.

## Documentacao

A documentacao da API foi organizada na pasta [`../../docs`](../../docs):

- [`openapi.yaml`](../../docs/openapi.yaml): especificacao OpenAPI 3.0.3.
- [`documentacao-api.md`](../../docs/documentacao-api.md): documento tecnico em Markdown.
- [`prompt-pdf-documentacao.md`](../../docs/prompt-pdf-documentacao.md): prompt pronto para gerar o PDF formatado da entrega academica.

Com a API em execucao, o Swagger UI fica disponivel em:

- `http://localhost:3000/api-docs`
- `http://localhost:3000/api-docs-json`

## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
