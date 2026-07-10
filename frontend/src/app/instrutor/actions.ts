"use server";

import { revalidatePath } from "next/cache";
import {
  adicionarAula,
  adicionarMaterial,
  atualizarAula,
  atualizarAvatarInstrutor,
  atualizarMaterialVisibilidade,
  getPresencasPorAula,
  registrarPresencas,
  removerAula,
  removerMaterial,
} from "@/services/instrutorService";
import type {
  AdicionarAulaInput,
  AdicionarMaterialInput,
  AlunoPresenca,
  ArquivoUpload,
  AtualizarAulaInput,
  AulaResumo,
  RegistrarPresencasInput,
} from "@/types/instrutor";

export type ActionResult =
  | { ok: true; mensagem: string }
  | { ok: false; erro: string };

export type PresencasActionResult =
  | { ok: true; alunos: AlunoPresenca[] }
  | { ok: false; erro: string };

const traduzirErro = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const revalidarInstrutor = () => {
  revalidatePath("/instrutor/dashboard");
  revalidatePath("/instrutor/cronograma");
  revalidatePath("/instrutor/presenca");
  revalidatePath("/instrutor/frequencia");
  revalidatePath("/instrutor/materiais");
  revalidatePath("/instrutor/perfil");
  revalidatePath("/instrutor/configuracoes");
};

export const salvarPresencasAction = async (
  input: RegistrarPresencasInput,
): Promise<ActionResult> => {
  try {
    await registrarPresencas(input);
    revalidarInstrutor();
    return { ok: true, mensagem: "Presenca salva com sucesso!" };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao salvar a presenca."),
    };
  }
};

export const adicionarMaterialAction = async (
  input: AdicionarMaterialInput,
): Promise<ActionResult> => {
  try {
    await adicionarMaterial(input);
    revalidarInstrutor();
    return { ok: true, mensagem: "Material adicionado com sucesso!" };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao adicionar o material."),
    };
  }
};

export const removerMaterialAction = async (
  turmaId: string,
  materialId: string,
): Promise<ActionResult> => {
  try {
    await removerMaterial(turmaId, materialId);
    revalidarInstrutor();
    return { ok: true, mensagem: "Material removido com sucesso!" };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao remover o material."),
    };
  }
};

export const atualizarMaterialVisibilidadeAction = async (
  turmaId: string,
  materialId: string,
  visibilidade: "visivel" | "oculto",
): Promise<ActionResult> => {
  try {
    await atualizarMaterialVisibilidade(turmaId, materialId, visibilidade);
    revalidarInstrutor();
    revalidatePath("/coordenador/turmas");
    return { ok: true, mensagem: "Visibilidade atualizada com sucesso!" };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao atualizar a visibilidade."),
    };
  }
};

export const adicionarAulaAction = async (
  input: AdicionarAulaInput,
): Promise<ActionResult & { aula?: AulaResumo }> => {
  try {
    const aula = await adicionarAula(input);
    revalidarInstrutor();
    return { ok: true, mensagem: "Aula adicionada ao cronograma!", aula };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao adicionar a aula."),
    };
  }
};

export const removerAulaAction = async (
  turmaId: string,
  aulaId: string,
): Promise<ActionResult> => {
  try {
    await removerAula(turmaId, aulaId);
    revalidarInstrutor();
    return { ok: true, mensagem: "Aula removida com sucesso!" };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao remover a aula."),
    };
  }
};

export const atualizarAulaAction = async (
  input: AtualizarAulaInput,
): Promise<ActionResult & { aula?: AulaResumo }> => {
  try {
    const aula = await atualizarAula(input);
    revalidarInstrutor();
    return {
      ok: true,
      mensagem:
        input.status === "cancelada"
          ? "Aula cancelada com sucesso. Os alunos ativos serao notificados por e-mail."
          : "Aula atualizada com sucesso.",
      aula,
    };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao atualizar a aula."),
    };
  }
};

export const buscarPresencasPorAulaAction = async (
  turmaId: string,
  aulaId: string,
): Promise<PresencasActionResult> => {
  try {
    const alunos = await getPresencasPorAula(turmaId, aulaId);
    return { ok: true, alunos };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao consultar a presenca da aula."),
    };
  }
};

export const atualizarAvatarAction = async (
  instrutorId: string,
  arquivo: ArquivoUpload,
): Promise<ActionResult & { avatarUrl?: string }> => {
  try {
    const resultado = await atualizarAvatarInstrutor(instrutorId, arquivo);
    revalidarInstrutor();
    return {
      ok: true,
      mensagem: "Foto de perfil atualizada com sucesso!",
      avatarUrl: resultado.avatarUrl,
    };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao atualizar a foto de perfil."),
    };
  }
};
