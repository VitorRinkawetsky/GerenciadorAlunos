# Documentacao da API - Gerenciador de Alunos

## 1. Visao geral

Esta documentacao descreve a API REST do projeto **Gerenciador de Alunos**, desenvolvida em NestJS. O sistema permite cadastrar cursos, alunos, disciplinas e matriculas, alem de consultar relacionamentos entre essas entidades.

A especificacao OpenAPI oficial do projeto esta no arquivo [`openapi.yaml`](./openapi.yaml). Ela pode ser importada no Swagger Editor, Swagger UI, Redoc ou Postman.

## 2. Informacoes da API

| Item | Valor |
| --- | --- |
| Nome | Gerenciador de Alunos API |
| Versao da documentacao | 1.0.0 |
| Base URL local | `http://localhost:3000` |
| Formato de dados | JSON |
| Autenticacao | Nao implementada |
| Persistencia atual | Memoria da aplicacao |

## 3. Versionamento

A documentacao foi definida como versao **1.0.0**, seguindo SemVer:

- **MAJOR**: alteracoes incompativeis nos contratos da API.
- **MINOR**: novos endpoints ou novos campos retrocompativeis.
- **PATCH**: correcoes de texto, exemplos ou ajustes sem mudanca de contrato.

O backend atual nao possui prefixo de rota como `/v1`; portanto, o versionamento esta registrado na documentacao OpenAPI.

## 4. Padrao de erro

Todos os erros passam por um filtro global e retornam o mesmo formato:

```json
{
  "statusCode": 400,
  "message": ["nome must be longer than or equal to 3 characters"],
  "error": "Bad Request",
  "timestamp": "2026-07-01T12:00:00.000Z",
  "path": "/cursos"
}
```

Campos:

| Campo | Descricao |
| --- | --- |
| `statusCode` | Codigo HTTP do erro |
| `message` | Mensagem de erro ou lista de mensagens de validacao |
| `error` | Nome resumido do erro, quando disponivel |
| `timestamp` | Data e hora da resposta |
| `path` | Caminho chamado na API |

## 5. Codigos de status utilizados

| Status | Uso |
| --- | --- |
| `200 OK` | Consulta, atualizacao ou exclusao realizada |
| `201 Created` | Recurso criado com sucesso |
| `400 Bad Request` | Dados invalidos, ID invalido ou regra de negocio violada |
| `404 Not Found` | Recurso nao encontrado |
| `409 Conflict` | Conflito de unicidade ou operacao impedida por relacionamento |
| `500 Internal Server Error` | Erro inesperado |

## 6. Recursos documentados

### 6.1 Health

#### `GET /`

Verifica se a API esta respondendo.

Resposta `200`:

```text
Hello World!
```

### 6.2 Cursos

Entidade responsavel por agrupar alunos e disciplinas.

#### `POST /cursos`

Cria um curso.

Request:

```json
{
  "nome": "Analise e Desenvolvimento de Sistemas",
  "descricao": "Curso superior de tecnologia focado em desenvolvimento de software."
}
```

Validacoes:

| Campo | Regras |
| --- | --- |
| `nome` | Obrigatorio, texto, 3 a 100 caracteres |
| `descricao` | Obrigatorio, texto, 10 a 500 caracteres |

Possiveis respostas:

| Status | Descricao |
| --- | --- |
| `201` | Curso criado |
| `400` | Dados invalidos |
| `409` | Ja existe curso com o mesmo nome |

Exemplo de resposta `201`:

```json
{
  "id": 1,
  "nome": "Analise e Desenvolvimento de Sistemas",
  "descricao": "Curso superior de tecnologia focado em desenvolvimento de software.",
  "createdAt": "2026-07-01T12:00:00.000Z",
  "updatedAt": "2026-07-01T12:00:00.000Z"
}
```

#### `GET /cursos`

Lista cursos com paginacao.

Query params:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `page` | number | Pagina, minimo 1, padrao 1 |
| `limit` | number | Tamanho da pagina, 1 a 100, padrao 10 |
| `nome` | string | Filtro parcial por nome |

Exemplo de resposta `200`:

```json
{
  "data": [
    {
      "id": 1,
      "nome": "Analise e Desenvolvimento de Sistemas",
      "descricao": "Curso superior de tecnologia focado em desenvolvimento de software.",
      "createdAt": "2026-07-01T12:00:00.000Z",
      "updatedAt": "2026-07-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### `GET /cursos/{id}`

Busca curso por ID.

#### `PATCH /cursos/{id}`

Atualiza parcialmente um curso.

#### `DELETE /cursos/{id}`

Remove um curso.

### 6.3 Alunos

Entidade que representa estudantes vinculados a um curso.

#### `POST /alunos`

Cria um aluno.

Request:

```json
{
  "nome": "Maria Oliveira",
  "email": "maria.oliveira@email.com",
  "matricula": "ADS2026001",
  "cursoId": 1
}
```

Validacoes:

| Campo | Regras |
| --- | --- |
| `nome` | Obrigatorio, texto, 3 a 100 caracteres |
| `email` | Obrigatorio, e-mail valido |
| `matricula` | Obrigatorio, texto, 5 a 20 caracteres |
| `cursoId` | Obrigatorio, inteiro positivo |

Regras de negocio:

- O e-mail deve ser unico.
- A matricula deve ser unica.
- O curso informado deve existir.

Exemplo de resposta `201`:

```json
{
  "id": 1,
  "nome": "Maria Oliveira",
  "email": "maria.oliveira@email.com",
  "matricula": "ADS2026001",
  "cursoId": 1,
  "createdAt": "2026-07-01T12:00:00.000Z",
  "updatedAt": "2026-07-01T12:00:00.000Z"
}
```

#### `GET /alunos`

Lista alunos com paginacao.

Query params:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `page` | number | Pagina, minimo 1, padrao 1 |
| `limit` | number | Tamanho da pagina, 1 a 100, padrao 10 |
| `nome` | string | Filtro parcial por nome |
| `cursoId` | number | Filtra alunos por curso |

#### `GET /alunos/{id}`

Busca aluno por ID.

#### `PATCH /alunos/{id}`

Atualiza parcialmente um aluno.

#### `DELETE /alunos/{id}`

Remove um aluno.

### 6.4 Disciplinas

Entidade que representa disciplinas de um curso, com controle de vagas e pre-requisitos.

#### `POST /disciplinas`

Cria uma disciplina.

Request:

```json
{
  "nome": "Programacao Web",
  "codigo": "WEB101",
  "cargaHoraria": 80,
  "limiteVagas": 40,
  "cursoId": 1,
  "prerequisitoIds": [],
  "ativa": true
}
```

Validacoes:

| Campo | Regras |
| --- | --- |
| `nome` | Obrigatorio, texto, 3 a 120 caracteres |
| `codigo` | Obrigatorio, texto, 2 a 20 caracteres |
| `cargaHoraria` | Obrigatorio, inteiro positivo, maximo 400 |
| `limiteVagas` | Obrigatorio, inteiro positivo, maximo 500 |
| `cursoId` | Obrigatorio, inteiro positivo |
| `prerequisitoIds` | Opcional, lista unica de inteiros positivos |
| `ativa` | Opcional, booleano, padrao `true` |

Regras de negocio:

- O curso informado deve existir.
- O codigo da disciplina deve ser unico.
- Todos os pre-requisitos informados devem existir.
- Uma disciplina nao pode ser pre-requisito dela mesma.
- Alteracoes nao podem criar dependencia circular.
- O limite de vagas nao pode ser reduzido abaixo do numero de vagas ocupadas.

Exemplo de resposta `201`:

```json
{
  "id": 1,
  "nome": "Programacao Web",
  "codigo": "WEB101",
  "cargaHoraria": 80,
  "limiteVagas": 40,
  "ativa": true,
  "cursoId": 1,
  "prerequisitoIds": [],
  "createdAt": "2026-07-01T12:00:00.000Z",
  "updatedAt": "2026-07-01T12:00:00.000Z",
  "vagasDisponiveis": 40
}
```

#### `GET /disciplinas`

Lista disciplinas com paginacao.

Query params:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `page` | number | Pagina, minimo 1, padrao 1 |
| `limit` | number | Tamanho da pagina, 1 a 100, padrao 10 |
| `nome` | string | Filtro parcial por nome |
| `cursoId` | number | Filtra disciplinas por curso |
| `ativa` | boolean | Filtra por disciplinas ativas ou inativas |

#### `GET /disciplinas/{id}`

Busca disciplina por ID.

#### `GET /disciplinas/{id}/prerequisitos`

Lista as disciplinas que sao pre-requisitos da disciplina informada.

#### `PATCH /disciplinas/{id}`

Atualiza parcialmente uma disciplina.

#### `DELETE /disciplinas/{id}`

Remove uma disciplina. A exclusao pode ser bloqueada quando a disciplina possui matriculas ou e pre-requisito de outra disciplina.

### 6.5 Matriculas

Entidade intermediaria que representa a relacao entre aluno e disciplina.

#### `POST /matriculas`

Cria uma matricula.

Request:

```json
{
  "alunoId": 1,
  "disciplinaId": 1
}
```

Validacoes:

| Campo | Regras |
| --- | --- |
| `alunoId` | Obrigatorio, inteiro positivo |
| `disciplinaId` | Obrigatorio, inteiro positivo |

Regra de negocio:

- O mesmo aluno nao pode ser matriculado duas vezes na mesma disciplina.

Observacao: na implementacao atual, o servico de matriculas valida duplicidade, mas nao valida a existencia do aluno ou da disciplina informados.

Exemplo de resposta `201`:

```json
{
  "id": 1,
  "alunoId": 1,
  "disciplinaId": 1,
  "createdAt": "2026-07-01T12:00:00.000Z"
}
```

#### `GET /matriculas`

Lista todas as matriculas.

Exemplo de resposta `200`:

```json
[
  {
    "id": 1,
    "alunoId": 1,
    "disciplinaId": 1,
    "createdAt": "2026-07-01T12:00:00.000Z"
  }
]
```

#### `GET /matriculas/{id}`

Busca matricula por ID.

#### `GET /matriculas/alunos/{id}/disciplinas`

Lista registros de matricula associados a um aluno.

Observacao: o papel de relacionamento do trabalho cita `/alunos/{id}/disciplinas`, mas a implementacao atual expõe esse recurso dentro do prefixo `/matriculas`.

#### `GET /matriculas/disciplinas/{id}/alunos`

Lista registros de matricula associados a uma disciplina.

Observacao: o papel de relacionamento do trabalho cita `/disciplinas/{id}/alunos`, mas a implementacao atual expõe esse recurso dentro do prefixo `/matriculas`.

#### `GET /matriculas/cursos/{id}/alunos`

Endpoint implementado no controller. No servico atual, retorna lista vazia.

Observacao: o papel de relacionamento do trabalho cita `/cursos/{id}/alunos`, mas a implementacao atual expõe esse recurso dentro do prefixo `/matriculas`.

## 7. Exemplos de fluxo

### 7.1 Criar curso, aluno e disciplina

1. Criar curso em `POST /cursos`.
2. Criar aluno usando o `cursoId` retornado.
3. Criar disciplina usando o mesmo `cursoId`.
4. Criar matricula com `alunoId` e `disciplinaId`.

### 7.2 Consultar disciplinas de um aluno

1. Criar aluno.
2. Criar disciplina.
3. Criar matricula.
4. Consultar `GET /matriculas/alunos/{id}/disciplinas`.

## 8. Como usar a especificacao OpenAPI

Opcoes recomendadas:

- Abrir o arquivo `docs/openapi.yaml` no Swagger Editor.
- Importar `docs/openapi.yaml` no Postman.
- Gerar uma pagina estatica com Redoc.

Exemplo com Redocly CLI:

```bash
npx @redocly/cli build-docs docs/openapi.yaml -o docs/api.html
```

## 9. Escopo entregue pela documentacao

Esta entrega cobre:

- Swagger/OpenAPI em formato YAML.
- Exemplos de request e response.
- Codigos HTTP utilizados.
- Casos de erro e validacao.
- Versionamento da API.
- Observacoes sobre diferencas entre o enunciado dos papeis e as rotas implementadas.
