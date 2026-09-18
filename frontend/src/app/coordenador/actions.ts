"use server";

import { revalidatePath } from "next/cache";
import type {
  CertificadoFormData,
  ConfiguracoesData,
  InstituicaoFormData,
  PeriodoLetivoFormData,
  PreferenciasFormData,
} from "@/schemas/configuracionsSchema";
import type { AuthenticatedFileResponse } from "@/services/apiClient";
import { configService } from "@/services/configService";
import * as coordinatorService from "@/services/coordinatorService";
import {
  atualizarAvatarCoordenador,
  removerAvatarCoordenador,
} from "@/services/coordinatorService";
import { downloadMaterialTurma } from "@/services/instrutorService";
import type { PeriodoLetivoResponse } from "@/services/periodoLetivoService";
import { atualizarPeriodoLetivo } from "@/services/periodoLetivoService";
import type {
  CertificateDetail,
  CoordinatorReportFilters,
  CoordinatorReportType,
  EnrollmentClassOption,
  GeneratedReport,
  Student,
  UserStatus,
} from "@/types/coordinator";
import type { ArquivoUpload } from "@/types/instrutor";
import { mensagemDeErroDeAction } from "@/utils/erroDeAction";

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

interface ResultadoRelatorioGeradoAction extends ResultadoAction {
  relatorio: GeneratedReport | null;
}

export async function criarCursoAction(input: {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  periodoLetivo: string;
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
      mensagem: mensagemDeErroDeAction(error, "Falha ao cadastrar o curso."),
    };
  }
}

export async function atualizarCursoAction(
  id: string,
  input: {
    nome: string;
    descricao: string;
    cargaHoraria: number;
    periodoLetivo: string;
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
      mensagem: mensagemDeErroDeAction(error, "Falha ao atualizar o curso."),
    };
  }
}

export async function excluirCursoAction(id: string): Promise<ResultadoAction> {
  try {
    await coordinatorService.deleteCourse(id);
    revalidatePath("/coordenador/cursos");
    revalidatePath("/coordenador/dashboard");
    return { sucesso: true, mensagem: "Curso excluído com sucesso." };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(error, "Falha ao excluir o curso."),
    };
  }
}

export async function excluirTurmaAction(id: string): Promise<ResultadoAction> {
  try {
    await coordinatorService.deleteClass(id);
    revalidatePath("/coordenador/turmas");
    revalidatePath("/coordenador/dashboard");
    return { sucesso: true, mensagem: "Turma excluída com sucesso." };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(error, "Falha ao excluir a turma."),
    };
  }
}

export async function excluirInstrutorAction(
  id: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.deleteInstructor(id);
    revalidatePath("/coordenador/instrutores");
    revalidatePath("/coordenador/turmas");
    revalidatePath("/coordenador/usuarios");
    revalidatePath("/coordenador/dashboard");
    return { sucesso: true, mensagem: "Instrutor excluído com sucesso." };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(error, "Falha ao excluir o instrutor."),
    };
  }
}

export async function excluirUsuarioAction(
  id: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.deleteUser(id);
    revalidatePath("/coordenador/usuarios");
    revalidatePath("/coordenador/alunos");
    revalidatePath("/coordenador/instrutores");
    revalidatePath("/coordenador/dashboard");
    return { sucesso: true, mensagem: "Usuário excluído com sucesso." };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(error, "Falha ao excluir o usuário."),
    };
  }
}

export async function excluirAlunoAction(id: string): Promise<ResultadoAction> {
  try {
    await coordinatorService.deleteStudent(id);
    revalidatePath("/coordenador/alunos");
    revalidatePath("/coordenador/turmas");
    revalidatePath("/coordenador/usuarios");
    revalidatePath("/coordenador/certificados");
    revalidatePath("/coordenador/dashboard");
    return { sucesso: true, mensagem: "Aluno excluído com sucesso." };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(error, "Falha ao excluir o aluno."),
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
      mensagem: `Instrutor ${convite.nome} cadastrado. Nenhum e-mail foi enviado — use "Reenviar ativação" quando ele precisar acessar o sistema.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao enviar o convite de ativacao.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao enviar o convite de coordenador.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao atualizar os dados do instrutor.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao atualizar o status do instrutor.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao reenviar o link de ativacao.",
      ),
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
      mensagem: `Aluno ${convite.nome} cadastrado. Nenhum e-mail foi enviado — use "Reenviar ativação" quando ele precisar acessar o sistema.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao enviar o convite de ativacao.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao atualizar os dados do aluno.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao reenviar o link de ativação.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao atualizar o status da conta.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao carregar as turmas disponíveis.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao vincular o aluno à turma.",
      ),
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
      mensagem:
        "Aluno desvinculado da turma. Ele já pode ser vinculado a outra turma deste período.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao desvincular o aluno da turma.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao baixar o PDF do certificado.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao carregar o PDF do certificado.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao emitir o certificado do aluno.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao cancelar o certificado.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Não foi possível gerar o relatório.",
      ),
      arquivo: null,
    };
  }
}

export async function gerarRelatorioGeradoAction(
  tipo: CoordinatorReportType,
  filtros: CoordinatorReportFilters,
): Promise<ResultadoRelatorioGeradoAction> {
  try {
    const relatorio = await coordinatorService.generateReport({
      tipo,
      filtros,
    });
    revalidatePath("/coordenador/relatorios");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Relatório gerado e salvo com sucesso.",
      relatorio,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Não foi possível gerar o relatório.",
      ),
      relatorio: null,
    };
  }
}

export async function baixarRelatorioGeradoCsvAction(
  id: string,
): Promise<ResultadoExportacaoRelatorioAction> {
  try {
    const arquivo = await coordinatorService.downloadGeneratedReportCsv(id);
    return {
      sucesso: true,
      mensagem: "CSV baixado com sucesso.",
      arquivo,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(error, "Não foi possível baixar o CSV."),
      arquivo: null,
    };
  }
}

export async function baixarRelatorioGeradoPdfAction(
  id: string,
): Promise<ResultadoExportacaoRelatorioAction> {
  try {
    const arquivo = await coordinatorService.downloadGeneratedReportPdf(id);
    return {
      sucesso: true,
      mensagem: "PDF baixado com sucesso.",
      arquivo,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(error, "Não foi possível baixar o PDF."),
      arquivo: null,
    };
  }
}

export async function deletarRelatorioGeradoAction(
  id: string,
): Promise<ResultadoAction> {
  try {
    await coordinatorService.deleteGeneratedReport(id);
    revalidatePath("/coordenador/relatorios");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Relatório excluído com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Não foi possível excluir o relatório.",
      ),
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
      mensagem: mensagemDeErroDeAction(error, "Falha ao cadastrar a turma."),
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
      mensagem: mensagemDeErroDeAction(error, "Falha ao atualizar a turma."),
    };
  }
}

export async function definirCancelamentoDaTurmaAction(
  id: string,
  cancelada: boolean,
): Promise<ResultadoAction> {
  try {
    const turma = await coordinatorService.setClassCancelled(id, cancelada);
    revalidatePath("/coordenador/turmas");
    revalidatePath(`/coordenador/turmas/${id}`);
    revalidatePath("/coordenador/cursos");
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: cancelada
        ? `Turma "${turma.nome}" cancelada.`
        : `Turma "${turma.nome}" reativada. O status volta a ser calculado pelo sistema.`,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        cancelada ? "Falha ao cancelar a turma." : "Falha ao reativar a turma.",
      ),
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
      mensagem: mensagemDeErroDeAction(error, "Falha ao atualizar o usuário."),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao atualizar o status do usuário.",
      ),
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
      mensagem: mensagemDeErroDeAction(error, "Falha ao carregar os alunos."),
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
      mensagem: mensagemDeErroDeAction(error, "Falha ao carregar os alunos."),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao adicionar o aluno na turma.",
      ),
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
      mensagem: mensagemDeErroDeAction(
        error,
        "Falha ao remover o aluno da turma.",
      ),
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
    revalidatePath("/coordenador/dashboard");
    return {
      sucesso: true,
      mensagem: "Dados da instituição atualizados com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Erro ao atualizar dados da instituição.",
      ),
    };
  }
}

export async function atualizarPeriodoLetivoConfigAction(
  dados: PeriodoLetivoFormData,
): Promise<ResultadoAction> {
  try {
    await configService.atualizarPeriodoLetivo(dados);
    revalidatePath("/coordenador/configuracoes");
    revalidatePath("/coordenador/dashboard");
    revalidatePath("/coordenador/turmas");
    return {
      sucesso: true,
      mensagem: "Período letivo atualizado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Erro ao atualizar período letivo.",
      ),
    };
  }
}

export async function atualizarCertificadoAction(
  dados: CertificadoFormData,
): Promise<ResultadoAction> {
  try {
    await configService.atualizarCertificado(dados);
    revalidatePath("/coordenador/configuracoes");
    revalidatePath("/coordenador/certificados");
    return {
      sucesso: true,
      mensagem: "Regras de certificado atualizadas com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Erro ao atualizar regras de certificado.",
      ),
    };
  }
}

export async function atualizarPreferenciasAction(
  dados: PreferenciasFormData,
): Promise<ResultadoAction> {
  try {
    await configService.atualizarPreferencias(dados);
    revalidatePath("/coordenador/configuracoes");
    revalidatePath("/coordenador/turmas");
    revalidatePath("/coordenador/dashboard");
    return { sucesso: true, mensagem: "Preferências atualizadas com sucesso." };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: mensagemDeErroDeAction(
        error,
        "Erro ao atualizar preferências.",
      ),
    };
  }
}

export async function baixarMaterialTurmaAction(
  turmaId: string,
  materialId: string,
): Promise<AuthenticatedFileResponse> {
  return await downloadMaterialTurma(turmaId, materialId);
}

type ResultadoAvatarCoordenador =
  | { ok: true; mensagem: string; avatarUrl?: string }
  | { ok: false; erro: string };

const mensagemAvatar = (error: unknown, padrao: string) =>
  mensagemDeErroDeAction(error, padrao);

export async function salvarFotoCoordenadorAction(
  arquivo: ArquivoUpload,
): Promise<ResultadoAvatarCoordenador> {
  try {
    const { avatarUrl } = await atualizarAvatarCoordenador(arquivo);
    revalidatePath("/coordenador/perfil");
    return { ok: true, mensagem: "Foto de perfil atualizada!", avatarUrl };
  } catch (error) {
    return {
      ok: false,
      erro: mensagemAvatar(error, "Falha ao atualizar a foto de perfil."),
    };
  }
}

export async function removerFotoCoordenadorAction(): Promise<ResultadoAvatarCoordenador> {
  try {
    await removerAvatarCoordenador();
    revalidatePath("/coordenador/perfil");
    return { ok: true, mensagem: "Foto de perfil removida." };
  } catch (error) {
    return {
      ok: false,
      erro: mensagemAvatar(error, "Falha ao remover a foto de perfil."),
    };
  }
}
