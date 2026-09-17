// Repositorio de leitura/escrita usado pela tela do instrutor.
// Como o painel e majoritariamente de leitura (agregacao de varias tabelas),
// trabalhamos com DTOs simples em vez de entidades ricas.

export type StatusPresenca = "presente" | "falta" | "justificada";

export const TIPOS_MATERIAL = [
  "pdf",
  "video",
  "imagem",
  "documento",
  "link",
  "outro",
] as const;

export type TipoMaterial = (typeof TIPOS_MATERIAL)[number];

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
  status: string;
}

export interface AulaDetalheNotificacao extends AulaResumo {
  turmaId: string;
  turma: string;
  curso: string;
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
  statusMatricula: "em_andamento" | "aprovado" | "reprovado_falta";
}

export interface SituacaoAula {
  numero: number;
  status: "planejada" | "realizada" | "cancelada";
  /** O horario de termino da aula ja passou (hora de Sao Paulo). */
  jaTerminou: boolean;
}

export interface AlunoNotificacaoAula {
  alunoId: string;
  nome: string;
  email: string;
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
    frequenciaMedia: number; // 0-100
  };
  alunos: AlunoPresenca[];
  cronograma: AulaResumo[];
  materiais: MaterialResumo[];
}

// O mesmo painel, recortado pela turma em vez do instrutor: e o que a
// coordenacao enxerga ao escolher uma turma qualquer. Deriva de
// InstrutorDashboard de proposito — as duas telas mostram os mesmos numeros,
// e uma metrica nova aqui nao pode nascer diferente da do instrutor.
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
  data?: string;
  horaInicio?: string | null;
  horaFim?: string | null;
  status?: "planejada" | "realizada" | "cancelada";
}

export interface InstrutorRepository {
  buscarDashboard(instrutorId: string): Promise<InstrutorDashboard | null>;
  buscarDashboardDaTurma(turmaId: string): Promise<TurmaDashboard | null>;
  listarMateriaisTurma(turmaId: string): Promise<MaterialResumo[]>;
  turmaPertenceAoInstrutor(
    turmaId: string,
    instrutorId: string,
  ): Promise<boolean>;
  registrarPresencas(input: RegistrarPresencasInput): Promise<void>;
  adicionarMaterial(input: AdicionarMaterialInput): Promise<MaterialResumo>;
  removerMaterial(materialId: string, turmaId: string): Promise<void>;
  atualizarMaterialVisibilidade(
    materialId: string,
    turmaId: string,
    visibilidade: "visivel" | "oculto",
  ): Promise<MaterialResumo>;
  adicionarAula(input: AdicionarAulaInput): Promise<AulaResumo>;
  buscarAulaParaNotificacao(
    turmaId: string,
    aulaId: string,
  ): Promise<AulaDetalheNotificacao | null>;
  listarAlunosParaNotificacaoAula(
    turmaId: string,
  ): Promise<AlunoNotificacaoAula[]>;
  atualizarAula(input: AtualizarAulaInput): Promise<AulaResumo>;
  removerAula(aulaId: string, turmaId: string): Promise<void>;
  buscarSituacaoAula(
    turmaId: string,
    aulaId: string,
  ): Promise<SituacaoAula | null>;
  preencherPresencasPendentes(
    turmaId: string,
    aulaId: string,
  ): Promise<number>;
  buscarPresencasPorAula(
    turmaId: string,
    aulaId: string,
  ): Promise<AlunoPresenca[]>;
  atualizarAvatar(instrutorId: string, avatarUrl: string): Promise<void>;
  removerAvatar(instrutorId: string): Promise<void>;
}
