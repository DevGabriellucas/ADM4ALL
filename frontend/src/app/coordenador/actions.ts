"use server";

import { revalidatePath } from "next/cache";
import * as coordinatorService from "@/services/coordinatorService";
import type {
  ClassGroup,
  Course,
  EditableEnrollmentStatus,
  EnrollmentClassOption,
  UserStatus,
} from "@/types/coordinator";

interface ResultadoAction {
  sucesso: boolean;
  mensagem: string;
}

interface TurmasParaMatriculaResultado extends ResultadoAction {
  turmas: EnrollmentClassOption[];
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

export async function convidarInstrutorAction(input: {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
}): Promise<ResultadoAction> {
  try {
    const convite = await coordinatorService.inviteInstructor(input);
    revalidatePath("/coordenador/instrutores");
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

export async function criarTurmaAction(input: {
  curso: string;
  nome: string;
  instrutor: string;
  dataInicio: string;
  dataTermino: string;
  horarios: string;
  limiteAlunos: number;
  status: ClassGroup["status"];
}): Promise<ResultadoAction> {
  try {
    const turma = await coordinatorService.createClass(input);
    revalidatePath("/coordenador/turmas");
    revalidatePath("/coordenador/dashboard");
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
