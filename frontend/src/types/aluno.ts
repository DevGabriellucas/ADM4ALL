export interface AlunoDashboard {
  id: string;
  nome: string;
  matricula: string | null;
  curso: string;
  avatarUrl: string;
  faltas: number;
  aulasPlanejadas: number;
  aulasConcluidas: number;
  progresso: number;
}
