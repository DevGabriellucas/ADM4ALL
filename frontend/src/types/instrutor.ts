import type { MatriculaStatus } from "@/constants/matriculaStatus";

export type StatusPresenca = "presente" | "falta" | "justificada";
export type StatusAula = "planejada" | "realizada" | "cancelada";

export type TipoMaterial =
  | "pdf"
  | "video"
  | "imagem"
  | "documento"
  | "link"
  | "outro";

export interface ArquivoUpload {
  nome: string;
  tipoMime: string;
  conteudoBase64: string;
}

export interface InstrutorResumo {
  id: string;
  usuarioId: string;
  nome: string;
  areaAtuacao: string | null;
  avatarUrl: string | null;
}

export interface TurmaResumo {
  id: string;
  codigo: string;
  nome: string;
  curso: string;
  turno: string;
  local: string | null;
  /** Periodo letivo da turma no formato AAAA.P (ex.: 2026.1). */
  periodoLetivo: string;
  status:
    | "planejada"
    | "em_andamento"
    | "concluida"
    | "encerrada"
    | "cancelada";
}

export interface AulaResumo {
  id: string;
  numero: number;
  titulo: string;
  data: string; // YYYY-MM-DD
  horaInicio: string | null;
  horaFim: string | null;
  status: StatusAula;
}

export interface AlunoPresenca {
  matriculaId: string;
  alunoId: string;
  nome: string;
  statusPresenca: StatusPresenca | null;
  presencas: number;
  /** Ausencias abonadas: nao contam como falta nem derrubam a frequencia. */
  justificadas: number;
  faltas: number;
  aulasRegistradas: number;
  frequencia: number;
  /** Desfecho academico da matricula, ja reavaliado pelo backend. */
  statusMatricula: MatriculaStatus;
}

export interface MaterialResumo {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  tamanhoBytes: number | null;
  dataPublicacao: string; // YYYY-MM-DD
  urlArquivo: string | null;
  aulaId: string | null;
  aulaTitulo: string | null;
  visibilidade: "visivel" | "oculto";
}

export interface InstrutorDashboard {
  instrutor: InstrutorResumo;
  turma: TurmaResumo | null;
  aulaReferencia: AulaResumo | null;
  /** Aula que esta por vir: a primeira cujo horario de termino ainda nao passou. */
  aulaAtual: AulaResumo | null;
  proximaAula: AulaResumo | null;
  metricas: {
    totalAlunos: number;
    presentesHoje: number;
    frequenciaMedia: number;
  };
  alunos: AlunoPresenca[];
  cronograma: AulaResumo[];
  materiais: MaterialResumo[];
}

// O mesmo painel, recortado pela turma em vez do instrutor. A coordenacao ve
// todas as turmas e escolhe uma no seletor; o instrutor cai sempre na turma
// vinculada a ele. Espelha TurmaDashboard do backend.
export interface TurmaDashboard
  extends Omit<InstrutorDashboard, "instrutor" | "turma"> {
  turma: TurmaResumo;
}

export interface RegistroPresenca {
  matriculaId: string;
  status: StatusPresenca;
}

export interface RegistrarPresencasInput {
  turmaId: string;
  aulaId: string;
  registros: RegistroPresenca[];
}

export interface AdicionarMaterialInput {
  turmaId: string;
  titulo: string;
  descricao?: string | null;
  tipo: TipoMaterial;
  urlArquivo?: string | null;
  tamanhoBytes?: number | null;
  publicadoPorId?: string | null;
  aulaId?: string | null;
  visibilidade?: "visivel" | "oculto";
  arquivo?: ArquivoUpload | null;
}

export interface AdicionarAulaInput {
  turmaId: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  horaInicio?: string | null;
  horaFim?: string | null;
}

export interface AtualizarAulaInput {
  turmaId: string;
  aulaId: string;
  titulo?: string;
  data?: string; // YYYY-MM-DD
  horaInicio?: string | null;
  horaFim?: string | null;
  status?: StatusAula;
}
