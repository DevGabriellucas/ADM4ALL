import type { MatriculaStatus } from "@/constants/matriculaStatus";

export type AlunoStatus = MatriculaStatus;

export interface AlunoDashboardResponse {
  nome: string;
  matricula: string | null;
  avatarUrl: string | null;
  semMatricula: boolean;
  cursoDeExtensao: {
    nomeCurso: string;
    qtdFaltas: number;
    qtdChamadasLancadas: number;
    qtdTotalAulas: number;
    qtdAulasConcluidas: number;
    progresso: number;
    status: AlunoStatus;
    cursoConcluido: boolean;
    certificadoLiberado: boolean;
  };
  certificadoDisponivel: boolean;
  certificadoUrl: string | null;
  frequencia: number;
  proximaAula: AulaEmFoco | null;
  historicoPresencas: HistoricoPresenca[];
  calendarioTurma: AulaCalendario[];
  comunicados: ComunicadoAluno[];
}

/**
 * A aula que o painel do aluno destaca: a proxima planejada ou, quando o
 * cronograma ja acabou, a ultima que aconteceu. `momento` diz qual das duas e,
 * para o cartao nao chamar de "proxima" uma aula que ja passou.
 */
export interface AulaEmFoco {
  titulo: string;
  data: string;
  horaInicio: string | null;
  horaFim: string | null;
  momento: "proxima" | "ultima";
}

export interface HistoricoPresenca {
  aula: string;
  data: string;
  situacao: "presente" | "falta" | "justificada" | "pendente";
}

export interface AulaCalendario {
  aula: string;
  data: string;
  status: "planejada" | "realizada" | "cancelada";
}

export interface ComunicadoAluno {
  titulo: string;
  mensagem: string;
  tipo: "informacao" | "atencao" | "importante";
}

export interface AlunoDashboard {
  nome: string;
  matricula: string | null;
  avatarUrl: string | null;
  /** Aluno cadastrado que ainda nao foi vinculado a nenhuma turma. */
  semMatricula: boolean;
  curso: string;
  faltas: number;
  /**
   * Chamadas ja lancadas para o aluno. Enquanto for zero a frequencia de 100%
   * e so o ponto de partida da regra, e nao desempenho: a tela mostra isso em
   * vez do percentual.
   */
  chamadasLancadas: number;
  aulasPlanejadas: number;
  aulasConcluidas: number;
  progresso: number;
  status: AlunoStatus;
  /** Todas as aulas nao canceladas da turma ja foram marcadas como realizadas. */
  cursoConcluido: boolean;
  /** Curso concluido e progresso suficiente para liberar o certificado. */
  certificadoLiberado: boolean;
  certificadoDisponivel: boolean;
  certificadoUrl: string | null;
  frequencia: number;
  proximaAula: AulaEmFoco | null;
  historicoPresencas: HistoricoPresenca[];
  calendarioTurma: AulaCalendario[];
  comunicados: ComunicadoAluno[];
}

export interface MaterialAluno {
  id: string;
  titulo: string;
  tipo: string;
  urlArquivo: string | null;
  turmaId: string;
  turmaNome: string;
  criadoEm: string;
}

export interface MaterialVisivelAluno {
  id: string;
  turmaId: string;
  turma: string;
  curso: string;
  aulaId: string | null;
  aulaTitulo: string | null;
  titulo: string;
  descricao: string | null;
  tipo: string;
  urlArquivo: string | null;
  tamanhoBytes: number | null;
  dataPublicacao: string;
}

export interface MateriaisVisiveisAlunoResponse {
  materiais: MaterialVisivelAluno[];
}
