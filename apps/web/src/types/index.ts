export interface Curso {
  id: number;
  nome: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
}

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  cursoId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Disciplina {
  id: number;
  nome: string;
  codigo: string;
  cargaHoraria: number;
  limiteVagas: number;
  vagasOcupadas: number;
  ativa: boolean;
  cursoId: number;
  prerequisitoIds: number[];
  createdAt: string;
  updatedAt: string;
}
