"use server";

import { revalidatePath } from "next/cache";
import * as coordinatorService from "@/services/coordinatorService";
import type { ClassGroup, Course } from "@/types/coordinator";

interface ResultadoAction {
  sucesso: boolean;
  mensagem: string;
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
