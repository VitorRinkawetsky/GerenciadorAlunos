import type { Curso, Aluno, Disciplina } from '../types'

export const API_BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000';

// ── Mock Store ────────────────────────────────────────────────────────────────

let _cursos: Curso[] = [
  { id: 1, nome: 'Ciência da Computação', descricao: 'Graduação com foco em algoritmos, teoria da computação e sistemas operacionais.', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, nome: 'Engenharia de Software', descricao: 'Formação voltada ao desenvolvimento, testes e manutenção de sistemas de software.', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
  { id: 3, nome: 'Sistemas de Informação', descricao: 'Integra tecnologia da informação com gestão empresarial e tomada de decisão.', createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-03T00:00:00Z' },
];

let _alunos: Aluno[] = [
  { id: 1, nome: 'Ana Silva', email: 'ana.silva@email.com', matricula: 'CC2024001', cursoId: 1, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 2, nome: 'Bruno Santos', email: 'bruno.santos@email.com', matricula: 'ES2024001', cursoId: 2, createdAt: '2024-02-02T00:00:00Z', updatedAt: '2024-02-02T00:00:00Z' },
  { id: 3, nome: 'Carla Oliveira', email: 'carla.oliveira@email.com', matricula: 'SI2024001', cursoId: 3, createdAt: '2024-02-03T00:00:00Z', updatedAt: '2024-02-03T00:00:00Z' },
  { id: 4, nome: 'Diego Martins', email: 'diego.martins@email.com', matricula: 'CC2024002', cursoId: 1, createdAt: '2024-02-04T00:00:00Z', updatedAt: '2024-02-04T00:00:00Z' },
];

let _disciplinas: Disciplina[] = [
  { id: 1, nome: 'Algoritmos e Estruturas de Dados', codigo: 'AED001', cargaHoraria: 80, limiteVagas: 40, vagasOcupadas: 35, ativa: true, cursoId: 1, prerequisitoIds: [], createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z' },
  { id: 2, nome: 'Programação Orientada a Objetos', codigo: 'POO001', cargaHoraria: 60, limiteVagas: 40, vagasOcupadas: 28, ativa: true, cursoId: 1, prerequisitoIds: [1], createdAt: '2024-03-02T00:00:00Z', updatedAt: '2024-03-02T00:00:00Z' },
  { id: 3, nome: 'Engenharia de Requisitos', codigo: 'ER001', cargaHoraria: 60, limiteVagas: 35, vagasOcupadas: 30, ativa: true, cursoId: 2, prerequisitoIds: [], createdAt: '2024-03-03T00:00:00Z', updatedAt: '2024-03-03T00:00:00Z' },
  { id: 4, nome: 'Banco de Dados', codigo: 'BD001', cargaHoraria: 80, limiteVagas: 40, vagasOcupadas: 40, ativa: false, cursoId: 1, prerequisitoIds: [1], createdAt: '2024-03-04T00:00:00Z', updatedAt: '2024-03-04T00:00:00Z' },
];

const _seq = { cursos: 4, alunos: 5, disciplinas: 5 };
const ts = () => new Date().toISOString();

// ── Cursos ────────────────────────────────────────────────────────────────────
// Para conectar ao backend: descomente o fetch e remova a linha do mock abaixo.

export const cursosApi = {
  list: async (): Promise<Curso[]> => {
    // return fetch(`${API_BASE}/cursos`).then(r => r.json()).then(p => p.data ?? p);
    return [..._cursos];
  },
  create: async (data: Pick<Curso, 'nome' | 'descricao'>): Promise<Curso> => {
    // return fetch(`${API_BASE}/cursos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
    const item: Curso = { ...data, id: ++_seq.cursos, createdAt: ts(), updatedAt: ts() };
    _cursos.push(item);
    return item;
  },
  update: async (id: number, data: Partial<Pick<Curso, 'nome' | 'descricao'>>): Promise<Curso> => {
    // return fetch(`${API_BASE}/cursos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
    const i = _cursos.findIndex(c => c.id === id);
    _cursos[i] = { ..._cursos[i], ...data, updatedAt: ts() };
    return _cursos[i];
  },
  delete: async (id: number): Promise<void> => {
    // await fetch(`${API_BASE}/cursos/${id}`, { method: 'DELETE' });
    _cursos = _cursos.filter(c => c.id !== id);
  },
};

// ── Alunos ────────────────────────────────────────────────────────────────────

export const alunosApi = {
  list: async (): Promise<Aluno[]> => {
    // return fetch(`${API_BASE}/alunos`).then(r => r.json()).then(p => p.data ?? p);
    return [..._alunos];
  },
  create: async (data: Pick<Aluno, 'nome' | 'email' | 'matricula' | 'cursoId'>): Promise<Aluno> => {
    // return fetch(`${API_BASE}/alunos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
    const item: Aluno = { ...data, id: ++_seq.alunos, createdAt: ts(), updatedAt: ts() };
    _alunos.push(item);
    return item;
  },
  update: async (id: number, data: Partial<Pick<Aluno, 'nome' | 'email' | 'matricula' | 'cursoId'>>): Promise<Aluno> => {
    // return fetch(`${API_BASE}/alunos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
    const i = _alunos.findIndex(a => a.id === id);
    _alunos[i] = { ..._alunos[i], ...data, updatedAt: ts() };
    return _alunos[i];
  },
  delete: async (id: number): Promise<void> => {
    // await fetch(`${API_BASE}/alunos/${id}`, { method: 'DELETE' });
    _alunos = _alunos.filter(a => a.id !== id);
  },
};

// ── Disciplinas ───────────────────────────────────────────────────────────────

export const disciplinasApi = {
  list: async (): Promise<Disciplina[]> => {
    // return fetch(`${API_BASE}/disciplinas`).then(r => r.json()).then(p => p.data ?? p);
    return [..._disciplinas];
  },
  create: async (data: Pick<Disciplina, 'nome' | 'codigo' | 'cargaHoraria' | 'limiteVagas' | 'cursoId' | 'prerequisitoIds' | 'ativa'>): Promise<Disciplina> => {
    // return fetch(`${API_BASE}/disciplinas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
    const item: Disciplina = { ...data, id: ++_seq.disciplinas, vagasOcupadas: 0, createdAt: ts(), updatedAt: ts() };
    _disciplinas.push(item);
    return item;
  },
  update: async (id: number, data: Partial<Pick<Disciplina, 'nome' | 'codigo' | 'cargaHoraria' | 'limiteVagas' | 'cursoId' | 'prerequisitoIds' | 'ativa'>>): Promise<Disciplina> => {
    // return fetch(`${API_BASE}/disciplinas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
    const i = _disciplinas.findIndex(d => d.id === id);
    _disciplinas[i] = { ..._disciplinas[i], ...data, updatedAt: ts() };
    return _disciplinas[i];
  },
  delete: async (id: number): Promise<void> => {
    // await fetch(`${API_BASE}/disciplinas/${id}`, { method: 'DELETE' });
    _disciplinas = _disciplinas.filter(d => d.id !== id);
  },
};
