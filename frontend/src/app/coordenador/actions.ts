"use server";

import { revalidatePath } from "next/cache";
import type {
  CertificadoFormData,
  ConfiguracoesData,
  InstituicaoFormData,
  PeriodoLetivoFormData,
  PreferenciasFormData,
} from "@/schemas/configuracionsSchema";
import { configService } from "@/services/configService";
import * as coordinatorService from "@/services/coordinatorService";
import type { PeriodoLetivoResponse } from "@/services/periodoLetivoService";
import { atualizarPeriodoLetivo } from "@/services/periodoLetivoService";
import type {
  CertificateDetail,
  ClassGroup,
  CoordinatorReportFilters,
  CoordinatorReportType,
  Course,
  EditableEnrollmentStatus,
  EnrollmentClassOption,
  Student,
  UserStatus,
} from "@/types/coordinator";

interface ResultadoAction {
  sucesso: boolean;
  mensagem: string;
}

interface TurmasParaMatriculaResultado extends ResultadoAction {
  turmas: EnrollmentClassOption[];
}

interface ResultadoCertificadoAction extends ResultadoAction {
  certificado: CertificateDetail | null;
}

interface ResultadoDownloadCertificadoAction extends ResultadoAction {
  arquivo: {
    base64: string;
    contentType: string;
    fileName: string;
  } | null;
}

interface ResultadoExportacaoRelatorioAction extends ResultadoAction {
  arquivo: {
    base64: string;
    contentType: string;
    fileName: string;
  } | null;
}

export async function criarCursoAction(input: {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  status: Course["status"];
}): Promise<ResultadoAction> {
  try {
    const curso = await coordinatorService.createCourse(input);
    revalidatePath("/coordenador/cursos");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: `Curso "${curso.nome}" cadastrado com sucesso.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Falha ao cadastrar o curso.",
    };
  }
}

export async function atualizarCursoAction(
  id: string,
  input: {
    nome: string;
    descricao: string;
    cargaHoraria: number;
    status: Course["status"];
  },
): Promise<ResultadoAction> {
  try {
    const curso = await coordinatorService.updateCourse(id, input);
    revalidatePath("/coordenador/cursos");
    revalidatePath(`/coordenador/cursos/${id}`);
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: `Curso "${curso.nome}" atualizado com sucesso.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Falha ao atualizar o curso.",
    };
  }
}

export async function desativarCursoAction(
  id: string,
): Promise<ResultadoAction> {
  try {
    const curso = await coordinatorService.deactivateCourse(id);
    if (!curso) {
      return { sucesso: false, mensagem: "Curso nao encontrado." };
    }
    revalidatePath("/coordenador/cursos");
    revalidatePath(`/coordenador/cursos/${id}`);
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: `Curso "${curso.nome}" desativado com sucesso.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Falha ao desativar o curso.",
    };
  }
}

export async function convidarInstrutorAction(input: {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
}): Promise<ResultadoAction> {
  try {
    const convite = await coordinatorService.inviteInstructor(input);
    revalidatePath("/coordenador/instrutores");
    revalidatePath("/coordenador/usuarios");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: `Convite de ativacao enviado para ${convite.nome}.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao enviar o convite de ativacao.",
    };
  }
}

export async function convidarCoordenadorAction(input: {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  areaCoordenacao?: string;
}): Promise<ResultadoAction> {
  try {
    const convite = await coordinatorService.inviteCoordinator(input);
    revalidatePath("/coordenador/usuarios");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: `Convite de ativacao enviado para ${convite.nome}.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao enviar o convite de coordenador.",
    };
  }
}

export async function atualizarInstrutorAction(
  id: string,
  input: {
    nome: string;
    email: string;
    telefone: string | null;
    areaAtuacao: string | null;
    formacao: string | null;
  },
): Promise<ResultadoAction> {
  try {
    await coordinatorService.updateInstructor(id, input);
    revalidatePath("/coordenador/instrutores");
    revalidatePath(`/coordenador/instrutores/${id}`);
    revalidatePath("/coordenador/turmas");
    return {
      sucesso: true,
      mensagem: "Dados do instrutor atualizados com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao atualizar os dados do instrutor.",
    };
  }
}

export async function atualizarStatusInstrutorAction(
  instrutorId: string,
  statusConta: UserStatus,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.updateInstructorStatus(instrutorId, statusConta);
    revalidatePath("/coordenador/instrutores");
    revalidatePath(`/coordenador/instrutores/${instrutorId}`);
    revalidatePath("/coordenador/turmas");
    return {
      sucesso: true,
      mensagem: "Status do instrutor atualizado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao atualizar o status do instrutor.",
    };
  }
}

export async function reenviarAtivacaoInstrutorAction(
  instrutorId: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.resendInstructorActivation(instrutorId);
    revalidatePath("/coordenador/instrutores");
    revalidatePath(`/coordenador/instrutores/${instrutorId}`);
    return {
      sucesso: true,
      mensagem: "Link de ativacao reenviado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao reenviar o link de ativacao.",
    };
  }
}

export async function convidarAlunoAction(input: {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  dataNascimento: string;
  curso: string;
  turma: string;
}): Promise<ResultadoAction> {
  try {
    const convite = await coordinatorService.inviteStudent(input);
    revalidatePath("/coordenador/alunos");
    revalidatePath("/coordenador/usuarios");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: `Convite de ativacao enviado para ${convite.nome}.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao enviar o convite de ativacao.",
    };
  }
}

export async function atualizarAlunoAction(
  id: string,
  input: {
    nome: string;
    email: string;
    telefone: string | null;
    statusConta: UserStatus;
  },
): Promise<ResultadoAction> {
  try {
    await coordinatorService.updateStudent(id, input);
    revalidatePath("/coordenador/alunos");
    revalidatePath(`/coordenador/alunos/${id}`);
    return {
      sucesso: true,
      mensagem: "Dados do aluno atualizados com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao atualizar os dados do aluno.",
    };
  }
}

export async function reenviarAtivacaoAction(
  alunoId: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.resendActivation(alunoId);
    revalidatePath("/coordenador/alunos");
    revalidatePath(`/coordenador/alunos/${alunoId}`);
    return {
      sucesso: true,
      mensagem: "Link de ativação reenviado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao reenviar o link de ativação.",
    };
  }
}

const STATUS_CONTA_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  ativo: ["inativo", "bloqueado"],
  inativo: ["ativo", "bloqueado"],
  bloqueado: ["ativo"],
  pendente_ativacao: [],
};

export async function atualizarStatusContaAction(
  alunoId: string,
  statusConta: UserStatus,
): Promise<ResultadoAction> {
  try {
    const aluno = await coordinatorService.getStudentById(alunoId);
    if (!aluno) {
      return { sucesso: false, mensagem: "Aluno não encontrado." };
    }

    if (!STATUS_CONTA_TRANSITIONS[aluno.statusConta].includes(statusConta)) {
      return {
        sucesso: false,
        mensagem: "Esta alteração de status não é permitida.",
      };
    }

    await coordinatorService.updateStudent(alunoId, {
      nome: aluno.nome,
      email: aluno.email,
      telefone: aluno.telefone,
      statusConta,
    });
    revalidatePath("/coordenador/alunos");
    revalidatePath(`/coordenador/alunos/${alunoId}`);
    return {
      sucesso: true,
      mensagem: "Status da conta atualizado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao atualizar o status da conta.",
    };
  }
}

export async function listarTurmasParaMatriculaAction(): Promise<TurmasParaMatriculaResultado> {
  try {
    const turmas = await coordinatorService.getEnrollmentClassOptions();
    return { sucesso: true, mensagem: "", turmas };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao carregar as turmas disponíveis.",
      turmas: [],
    };
  }
}

export async function vincularAlunoTurmaAction(
  alunoId: string,
  turmaId: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.enrollStudentInClass(turmaId, alunoId);
    revalidatePath("/coordenador/alunos");
    revalidatePath(`/coordenador/alunos/${alunoId}`);
    revalidatePath("/coordenador/turmas");
    revalidatePath(`/coordenador/turmas/${turmaId}`);
    return {
      sucesso: true,
      mensagem: "Aluno vinculado à turma com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao vincular o aluno à turma.",
    };
  }
}

export async function cancelarMatriculaAction(
  alunoId: string,
  turmaId: string,
  matriculaId: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.cancelStudentEnrollment(turmaId, matriculaId);
    revalidatePath("/coordenador/alunos");
    revalidatePath(`/coordenador/alunos/${alunoId}`);
    revalidatePath("/coordenador/turmas");
    revalidatePath(`/coordenador/turmas/${turmaId}`);
    return {
      sucesso: true,
      mensagem: "Matrícula cancelada com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao cancelar a matrícula.",
    };
  }
}

export async function atualizarStatusMatriculaAction(
  alunoId: string,
  matriculaId: string,
  status: EditableEnrollmentStatus,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.updateMatriculaStatus(matriculaId, status);
    revalidatePath("/coordenador/alunos");
    revalidatePath(`/coordenador/alunos/${alunoId}`);
    return {
      sucesso: true,
      mensagem: "Status da matrícula atualizado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao atualizar o status da matrícula.",
    };
  }
}

export async function baixarCertificadoPdfAction(
  referenciaId: string,
): Promise<ResultadoDownloadCertificadoAction> {
  try {
    const arquivo =
      await coordinatorService.downloadCertificatePdf(referenciaId);
    return {
      sucesso: true,
      mensagem: "PDF preparado para download.",
      arquivo,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao baixar o PDF do certificado.",
      arquivo: null,
    };
  }
}

export async function visualizarCertificadoPdfAction(
  referenciaId: string,
): Promise<ResultadoDownloadCertificadoAction> {
  try {
    const arquivo =
      await coordinatorService.getCertificatePdfPreview(referenciaId);
    return {
      sucesso: true,
      mensagem: "",
      arquivo,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao carregar o PDF do certificado.",
      arquivo: null,
    };
  }
}

export async function emitirCertificadoAlunoAction(
  matriculaId: string,
): Promise<ResultadoCertificadoAction> {
  try {
    const certificado =
      await coordinatorService.issueStudentCertificate(matriculaId);
    revalidatePath("/coordenador/certificados");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Certificado do aluno emitido com sucesso.",
      certificado,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao emitir o certificado do aluno.",
      certificado: null,
    };
  }
}

export async function cancelarCertificadoAction(
  certificadoId: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.cancelCertificate(certificadoId);
    revalidatePath("/coordenador/certificados");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Certificado cancelado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao cancelar o certificado.",
    };
  }
}

export async function exportarRelatorioAction(
  tipo: CoordinatorReportType,
  formato: "pdf" | "csv",
  filtros: CoordinatorReportFilters,
): Promise<ResultadoExportacaoRelatorioAction> {
  try {
    const arquivo = await coordinatorService.exportReport(
      tipo,
      formato,
      filtros,
    );
    return {
      sucesso: true,
      mensagem: "Relatório gerado com sucesso.",
      arquivo,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o relatório.",
      arquivo: null,
    };
  }
}

export async function criarTurmaAction(input: {
  curso: string;
  nome: string;
  instrutores: string[];
  periodoLetivo: string;
  horarios: string;
  capacidade: number;
  status: ClassGroup["status"];
  cursoId?: string;
}): Promise<ResultadoAction> {
  try {
    const turma = await coordinatorService.createClass(input);
    revalidatePath("/coordenador/turmas");
    revalidatePath("/coordenador/dashboard");
    if (input.cursoId) {
      revalidatePath(`/coordenador/cursos/${input.cursoId}`);
    }
    return {
      sucesso: true,
      mensagem: `Turma "${turma.nome}" cadastrada com sucesso.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Falha ao cadastrar a turma.",
    };
  }
}

export async function atualizarTurmaAction(
  id: string,
  input: {
    nome: string;
    curso: string;
    instrutores: string[];
    periodoLetivo: string;
    capacidade: number;
    status: ClassGroup["status"];
  },
): Promise<ResultadoAction> {
  try {
    const turma = await coordinatorService.updateClass(id, input);
    revalidatePath("/coordenador/turmas");
    revalidatePath(`/coordenador/turmas/${id}`);
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: `Turma "${turma.nome}" atualizada com sucesso.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Falha ao atualizar a turma.",
    };
  }
}

export async function encerrarTurmaAction(
  id: string,
): Promise<ResultadoAction> {
  try {
    const turma = await coordinatorService.closeClass(id);
    if (!turma) {
      return { sucesso: false, mensagem: "Turma nao encontrada." };
    }
    revalidatePath("/coordenador/turmas");
    revalidatePath(`/coordenador/turmas/${id}`);
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: `Turma "${turma.nome}" encerrada com sucesso.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Falha ao encerrar a turma.",
    };
  }
}

export async function atualizarPeriodoLetivoAction(
  periodoLetivo: string,
): Promise<PeriodoLetivoResponse> {
  return await atualizarPeriodoLetivo(periodoLetivo);
}

export async function atualizarUsuarioAction(
  id: string,
  input: {
    nome: string;
    email: string;
    cpf: string;
  },
): Promise<ResultadoAction> {
  try {
    await coordinatorService.updateUser(id, input);
    revalidatePath("/coordenador/usuarios");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Usuario atualizado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao atualizar o usuario.",
    };
  }
}

export async function atualizarStatusUsuarioAction(
  id: string,
  status: "ativo" | "inativo",
): Promise<ResultadoAction> {
  try {
    await coordinatorService.updateUserStatus(id, status);
    revalidatePath("/coordenador/usuarios");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Status do usuario atualizado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao atualizar o status do usuario.",
    };
  }
}

interface AlunosDaTurmaResultado extends ResultadoAction {
  students: Student[];
}

interface AlunosDisponiveisResultado extends ResultadoAction {
  students: Student[];
}

export async function buscarAlunosDaTurmaAction(
  turmaId: string,
): Promise<AlunosDaTurmaResultado> {
  try {
    const { students } =
      await coordinatorService.getClassStudentsAndLessons(turmaId);
    return { sucesso: true, mensagem: "", students };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Falha ao carregar os alunos.",
      students: [],
    };
  }
}

export async function buscarAlunosDisponiveisAction(): Promise<AlunosDisponiveisResultado> {
  try {
    const students = await coordinatorService.getStudents();
    return { sucesso: true, mensagem: "", students };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Falha ao carregar os alunos.",
      students: [],
    };
  }
}

export async function adicionarAlunoNaTurmaAction(
  turmaId: string,
  alunoId: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.enrollStudentInClass(turmaId, alunoId);
    revalidatePath("/coordenador/turmas");
    revalidatePath(`/coordenador/turmas/${turmaId}`);
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Aluno vinculado a turma com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao adicionar o aluno na turma.",
    };
  }
}

export async function removerAlunoDaTurmaAction(
  turmaId: string,
  matriculaId: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.cancelStudentEnrollment(turmaId, matriculaId);
    revalidatePath("/coordenador/turmas");
    revalidatePath(`/coordenador/turmas/${turmaId}`);
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Aluno removido da turma com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Falha ao remover o aluno da turma.",
    };
  }
}

export async function obterConfiguracoesAction(): Promise<ConfiguracoesData> {
  return configService.obter();
}

export async function atualizarInstituicaoAction(
  dados: InstituicaoFormData,
): Promise<ResultadoAction> {
  try {
    await configService.atualizarInstituicao(dados);
    revalidatePath("/coordenador/configuracoes");
    return {
      sucesso: true,
      mensagem: "Dados da instituição atualizados com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar dados da instituição.",
    };
  }
}

export async function atualizarPeriodoLetivoConfigAction(
  dados: PeriodoLetivoFormData,
): Promise<ResultadoAction> {
  try {
    await configService.atualizarPeriodoLetivo(dados);
    revalidatePath("/coordenador/configuracoes");
    return {
      sucesso: true,
      mensagem: "Período letivo atualizado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar período letivo.",
    };
  }
}

export async function atualizarCertificadoAction(
  dados: CertificadoFormData,
): Promise<ResultadoAction> {
  try {
    await configService.atualizarCertificado(dados);
    revalidatePath("/coordenador/configuracoes");
    return {
      sucesso: true,
      mensagem: "Regras de certificado atualizadas com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar regras de certificado.",
    };
  }
}

export async function atualizarPreferenciasAction(
  dados: PreferenciasFormData,
): Promise<ResultadoAction> {
  try {
    await configService.atualizarPreferencias(dados);
    revalidatePath("/coordenador/configuracoes");
    return { sucesso: true, mensagem: "Preferências atualizadas com sucesso." };
  } catch (error) {
    return {
      sucesso: false,
      mensagem:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar preferências.",
    };
  }
}
