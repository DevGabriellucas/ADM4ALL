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

export type CourseStatus = "ativo" | "em_planejamento" | "encerrado";

export type ClassStatus =
  | "planejada"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export type LessonStatus = "planejada" | "realizada" | "cancelada";

export type LessonScheduleStatus =
  | "concluida"
  | "proxima"
  | "pendente"
  | "cancelada";

export type ClassMaterialType = "PDF" | "Planilha" | "Apresentação" | "Link";

export type AttendanceSituation =
  | "regular"
  | "atencao"
  | "risco_reprovacao"
  | typeof MATRICULA_STATUS.REPROVADO_FALTA;

export type CertificateStatus = "pendente" | "emitido" | "cancelado";

export type CertificateEligibilityStatus = "elegivel" | "nao_elegivel";

export type CertificateDisplayStatus =
  | CertificateStatus
  | CertificateEligibilityStatus;

export type ProcessStatus = "aberto" | "em_analise" | "concluido" | "cancelado";

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
  dataCriacao: string;
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
  cpf: string | null;
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
  curso: string;
  instrutor: string;
  alunos: number;
  dataInicio: string;
  dataTermino: string;
  status: ClassStatus;
  frequenciaMedia: number;
}

export interface Lesson {
  id: string;
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
  turma: string;
  nome: string;
  tipo: ClassMaterialType;
  data: string;
  tamanho: string;
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
  cpfAluno: string;
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

export interface ProcessRecord {
  id: string;
  nome: string;
  status: ProcessStatus;
  responsavel: string;
  dataCriacao: string;
}

export interface ReportPreview {
  id: string;
  tipo: ReportType;
  titulo: string;
  descricao: string;
  ultimaAtualizacao: string;
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

export interface AccessProfileSetting {
  role: UserRole;
  label: string;
  description: string;
  enabled: boolean;
}

export interface CoordinatorSettings {
  account: {
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
  };
  system: {
    instituicao: string;
    periodoLetivo: string;
    frequenciaMinimaCertificado: number;
  };
  accessProfiles: AccessProfileSetting[];
  security: {
    sessoesAtivas: number;
    ultimaAlteracaoSenha: string;
  };
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
