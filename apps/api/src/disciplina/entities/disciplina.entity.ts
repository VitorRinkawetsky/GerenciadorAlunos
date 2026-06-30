export class Disciplina {
  id: number;
  nome: string;
  codigo: string;
  cargaHoraria: number;
  limiteVagas: number;
  vagasOcupadas: number;
  ativa: boolean;
  cursoId: number;
  prerequisitoIds: number[];
  createdAt: Date;
  updatedAt: Date;
}