export type StatusPresenca = "presente" | "falta" | "justificada";

export type TipoMaterial =
  | "pdf"
  | "video"
  | "imagem"
  | "documento"
  | "link"
  | "outro";

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
}

export interface AulaResumo {
  id: string;
  numero: number;
  titulo: string;
  data: string; // YYYY-MM-DD
  status: string;
}

export interface AlunoPresenca {
  matriculaId: string;
  alunoId: string;
  nome: string;
  statusPresenca: StatusPresenca | null;
  presencas: number;
  faltas: number;
  aulasRegistradas: number;
  frequencia: number;
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
  arquivo?: {
    nome: string;
    tipoMime: string;
    conteudoBase64: string;
  } | null;
}

export interface AdicionarAulaInput {
  turmaId: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  horaInicio?: string | null;
  horaFim?: string | null;
}

export interface AtualizarAulaInput {
  titulo?: string;
  data?: string;
  horaInicio?: string | null;
  horaFim?: string | null;
  status?: "planejada" | "realizada" | "cancelada";
}

