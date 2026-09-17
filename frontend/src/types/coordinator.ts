import type {
  MATRICULA_STATUS,
  MatriculaStatus,
} from "@/constants/matriculaStatus";

export type UserRole = "administrador" | "coordenador" | "instrutor" | "aluno";

export type UserStatus =
  | "ativo"
  | "pendente_ativacao"
  | "inativo"
  | "bloqueado";

export type CourseStatus = "ativo" | "em_planejamento" | "desativado";

export type ClassStatus =
  | "planejada"
  | "em_andamento"
  | "concluida"
  | "encerrada"
  | "cancelada";

export type LessonStatus = "planejada" | "realizada" | "cancelada";

export type ClassMaterialType = "PDF" | "Planilha" | "Apresentação" | "Link";

export type AttendanceSituation =
  | "regular"
  | "atencao"
  | "risco"
  | "risco_reprovacao"
  // Matricula sem nenhuma chamada registrada: frequencia 0% por ausencia de
  // dado, e nao por falta. Nao deve ser tratada como alerta.
  | "sem_registro"
  | typeof MATRICULA_STATUS.REPROVADO_FALTA;

export type CertificateStatus = "pendente" | "emitido" | "cancelado";

export type CertificateEligibilityStatus = "elegivel" | "nao_elegivel";

export type CertificateDisplayStatus =
  | CertificateStatus
  | CertificateEligibilityStatus;

export type ReportType =
  | "dashboard"
  | "cursos"
  | "turmas"
  | "alunos"
  | "instrutores"
  | "frequencia"
  | "certificados"
  | "processos";

export type CoordinatorReportType =
  | "frequencia_turma"
  | "reprovados_falta"
  | "elegiveis_certificado"
  | "certificados_emitidos"
  | "matriculas_curso"
  | "turmas_andamento";

export type ReportAggregation = "average" | "count" | "sum";

export interface BaseUser {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  role: UserRole;
  status: UserStatus;
  dataCriacao: string;
  ultimoAcesso: string | null;
}

export interface Instructor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  status: UserStatus;
  turmasVinculadas: number;
  dataCriacao: string;
}

export interface InstructorClassSummary {
  id: string;
  nome: string;
  curso: string;
  status: ClassStatus;
  dataInicio: string;
  dataTermino: string | null;
  alunos: number;
}

export interface InstructorDetail extends Instructor {
  usuarioId: string;
  areaAtuacao: string | null;
  formacao: string | null;
  ativo: boolean;
  turmas: InstructorClassSummary[];
}

export interface Student {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  turma: string;
  curso: string;
  frequencia: number;
  statusConta: UserStatus | null;
  statusMatricula: MatriculaStatus | null;
  statusTurma: ClassGroup["status"] | null;
  dataCriacao: string;
  matriculaId?: string;
}

export interface StudentEnrollment {
  id: string;
  turmaId: string | null;
  turma: string | null;
  curso: string | null;
  status: MatriculaStatus;
  frequencia: number;
  dataMatricula: string;
}

export interface StudentEnrollmentCreated {
  id: string;
  alunoId: string;
  turmaId: string;
  treinamentoId: string;
  status: MatriculaStatus;
  dataMatricula: string;
}

export type EditableEnrollmentStatus = Exclude<MatriculaStatus, "cancelado">;

export interface StudentEnrollmentStatusUpdated {
  id: string;
  status: MatriculaStatus;
  dataConclusao: string | null;
}

export interface EnrollmentClassOption {
  id: string;
  nome: string;
  curso: string;
  status: ClassStatus;
}

export interface StudentDetail {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string | null;
  dataNascimento: string | null;
  rgm: string | null;
  cursoUnipe: string | null;
  statusConta: UserStatus;
  dataCriacao: string;
  matriculas: StudentEnrollment[];
}

export interface Course {
  id: string;
  nome: string;
  descricao: string;
  cargaHoraria: number;
  status: CourseStatus;
  quantidadeTurmas: number;
}

export interface ClassGroup {
  id: string;
  nome: string;
  /** Codigo unico (ex.: ADM-2026-01). Distingue turmas de mesmo nome. */
  codigo: string;
  curso: string;
  instrutores: string;
  alunos: number;
  capacidade: number;
  dataInicio: string;
  dataTermino: string;
  periodoLetivo: string;
  status: ClassStatus;
  frequenciaMedia: number;
  /** Chamadas registradas. 0 = turma ainda sem chamada, nao 0% de presenca. */
  registrosFrequencia: number;
}

export interface Lesson {
  id: string;
  turmaId?: string;
  numeroAula: number;
  titulo: string;
  curso: string;
  turma: string;
  instrutor: string;
  data: string;
  status: LessonStatus;
}

export interface ClassMaterial {
  id: string;
  turmaId?: string;
  turma: string;
  nome: string;
  descricao?: string | null;
  tipo: ClassMaterialType | string;
  data: string;
  tamanho: string;
  urlArquivo?: string | null;
  aulaId?: string | null;
  aulaTitulo?: string | null;
  visibilidade?: "visivel" | "oculto";
}

export interface AttendanceSummary {
  aluno: string;
  turma: string;
  presencas: number;
  faltas: number;
  frequencia: number;
  situacao: AttendanceSituation;
}

export interface CertificateRecord {
  referenciaId: string;
  certificadoId: string | null;
  tipo: "aluno";
  nome: string;
  aluno: string;
  curso: string;
  turma: string | null;
  frequencia: number;
  elegivel: boolean;
  motivoInelegibilidade: string | null;
  status: CertificateStatus | null;
  certificado: string | null;
  dataEmissao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  cargaHoraria: number | null;
}

interface CertificateDetailBase {
  certificadoId: string | null;
  referenciaId: string;
  status: CertificateStatus | null;
  dataEmissao: string | null;
  cidade: string;
  codigo: string | null;
}

export interface StudentCertificateDetail extends CertificateDetailBase {
  tipo: "aluno";
  nomeAluno: string;
  nomeCurso: string;
  cargaHoraria: number;
  dataInicio: string;
  dataFim: string;
  nomeCoordenadora: string;
  nomeProjeto: string;
  textoDescritivo: string;
  statusMatricula: MatriculaStatus;
  statusTurma: ClassStatus;
  statusUsuario: UserStatus;
  faltas: number;
}

export type CertificateDetail = StudentCertificateDetail;

export interface ReportPreview {
  id: string;
  tipo: ReportType | CoordinatorReportType;
  titulo: string;
  descricao: string;
  ultimaAtualizacao: string;
  arquivoCsv?: string | null;
  arquivoPdf?: string | null;
  criadoEm?: string;
}

export interface ReportTableColumn {
  key: string;
  label: string;
}

export interface ReportDataRow {
  id: string;
  data: string;
  curso: string;
  turma: string;
  chartLabel: string;
  chartValue: number;
  metricNumerator?: number;
  metricDenominator?: number;
  values: Record<string, string | number>;
}

export interface CoordinatorReportFilters {
  dataInicio?: string;
  dataFim?: string;
  curso?: string;
  turma?: string;
}

export interface CoordinatorReportData {
  type: CoordinatorReportType;
  title: string;
  description: string;
  metricLabel: string;
  metricSuffix?: string;
  metricValue?: number;
  aggregation: ReportAggregation;
  columns: ReportTableColumn[];
  rows: ReportDataRow[];
}

export interface GeneratedReport {
  id: string;
  tipo: CoordinatorReportType;
  titulo: string;
  arquivoCsv: string | null;
  arquivoPdf: string | null;
  filtros: CoordinatorReportFilters | null;
  geradoPorId: string | null;
  criadoEm: string;
}

export interface CoordinatorDashboardSummary {
  totalCursos: number;
  totalTurmas: number;
  totalAlunos: number;
  totalInstrutores: number;
  frequenciaMedia: number;
  certificadosPendentes: number;
  processosAbertos: number;
  usuariosPendentes: number;
  relatorios: ReportPreview[];
}
