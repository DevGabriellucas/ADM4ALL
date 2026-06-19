export interface AlunoDashboard {
  id: string;
  nome: string;
  matricula: string;
  curso: string;
  avatarUrl: string;
  faltas: number;
  progresso: number;
  notas?: string;
  documentosPendentes?: string;
}
