export type UserRole = "administrador" | "coordenador" | "instrutor" | "aluno";

export type UserStatus = "ativo" | "pendente_ativacao" | "inativo";

export type StudentStatus = UserStatus | "reprovado_por_falta" | "concluido";

export type CourseStatus = "ativo" | "em_planejamento" | "encerrado";

export type ClassStatus =
  | "planejada"
  | "em_andamento"
  | "encerrada"
  | "cancelada";

export type LessonStatus = "planejada" | "realizada" | "cancelada";

export type ClassMaterialType = "PDF" | "Planilha" | "Apresentação" | "Link";

export type AttendanceSituation =
  | "regular"
  | "atencao"
  | "risco_reprovacao"
  | "reprovado_por_falta";

export type CertificateStatus = "pendente" | "emitido" | "bloqueado";

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

export interface BaseUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  dataCriacao: string;
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
  status: StudentStatus;
  dataCriacao: string;
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
  aluno: string;
  curso: string;
  turma: string;
  frequencia: number;
  status: CertificateStatus;
  certificado: string | null;
}

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
