export type AlunoStatus =
  | "em_andamento"
  | "aprovado"
  | "reprovado_falta"
  | "cancelado";

export interface AlunoDashboardResponse {
  nome: string;
  matricula: string | null;
  cursoDeExtensao: {
    nomeCurso: string;
    qtdFaltas: number;
    qtdTotalAulas: number;
    qtdAulasConcluidas: number;
    progresso: number;
    status: AlunoStatus;
  };
  certificadoDisponivel: boolean;
  certificadoUrl: string | null;
}

export interface AlunoDashboard {
  nome: string;
  matricula: string | null;
  curso: string;
  faltas: number;
  aulasPlanejadas: number;
  aulasConcluidas: number;
  progresso: number;
  status: AlunoStatus;
  certificadoDisponivel: boolean;
  certificadoUrl: string | null;
}
