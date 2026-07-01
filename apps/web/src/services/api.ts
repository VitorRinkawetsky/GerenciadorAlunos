import type { Curso, Aluno, Disciplina, Matricula } from '../types'

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

// Backend pagina em 10 itens por padrão; como o front ainda não tem paginação,
// pedimos o limite máximo aceito pela API para trazer a lista inteira.
const LIST_QS = '?limit=100';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message || `Erro ${res.status} ao acessar ${path}`);
  }

  return body as T;
}

// Resposta de disciplina do back expõe `vagasDisponiveis` em vez de `vagasOcupadas`.
type DisciplinaResponse = Omit<Disciplina, 'vagasOcupadas'> & { vagasDisponiveis: number };

function toDisciplina(raw: DisciplinaResponse): Disciplina {
  const { vagasDisponiveis, ...rest } = raw;
  return { ...rest, vagasOcupadas: rest.limiteVagas - vagasDisponiveis };
}

// ── Cursos ────────────────────────────────────────────────────────────────────

export const cursosApi = {
  list: (): Promise<Curso[]> =>
    request<PaginatedResult<Curso>>(`/cursos${LIST_QS}`).then(p => p.data),
  create: (data: Pick<Curso, 'nome' | 'descricao'>): Promise<Curso> =>
    request('/cursos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Pick<Curso, 'nome' | 'descricao'>>): Promise<Curso> =>
    request(`/cursos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> =>
    request(`/cursos/${id}`, { method: 'DELETE' }),
};

// ── Alunos ────────────────────────────────────────────────────────────────────

export const alunosApi = {
  list: (): Promise<Aluno[]> =>
    request<PaginatedResult<Aluno>>(`/alunos${LIST_QS}`).then(p => p.data),
  create: (data: Pick<Aluno, 'nome' | 'email' | 'matricula' | 'cursoId'>): Promise<Aluno> =>
    request('/alunos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Pick<Aluno, 'nome' | 'email' | 'matricula' | 'cursoId'>>): Promise<Aluno> =>
    request(`/alunos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> =>
    request(`/alunos/${id}`, { method: 'DELETE' }),
};

// ── Disciplinas ───────────────────────────────────────────────────────────────

export const disciplinasApi = {
  list: (): Promise<Disciplina[]> =>
    request<PaginatedResult<DisciplinaResponse>>(`/disciplinas${LIST_QS}`)
      .then(p => p.data.map(toDisciplina)),
  create: (data: Pick<Disciplina, 'nome' | 'codigo' | 'cargaHoraria' | 'limiteVagas' | 'cursoId' | 'prerequisitoIds' | 'ativa'>): Promise<Disciplina> =>
    request<DisciplinaResponse>(`/disciplinas`, { method: 'POST', body: JSON.stringify(data) }).then(toDisciplina),
  update: (id: number, data: Partial<Pick<Disciplina, 'nome' | 'codigo' | 'cargaHoraria' | 'limiteVagas' | 'cursoId' | 'prerequisitoIds' | 'ativa'>>): Promise<Disciplina> =>
    request<DisciplinaResponse>(`/disciplinas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(toDisciplina),
  delete: (id: number): Promise<void> =>
    request(`/disciplinas/${id}`, { method: 'DELETE' }),
};

// ── Matrículas ────────────────────────────────────────────────────────────────
// GET /matriculas não é paginado (retorna o array completo), diferente dos demais.

export const matriculasApi = {
  list: (): Promise<Matricula[]> =>
    request('/matriculas'),
  create: (data: Pick<Matricula, 'alunoId' | 'disciplinaId'>): Promise<Matricula> =>
    request('/matriculas', { method: 'POST', body: JSON.stringify(data) }),
};
