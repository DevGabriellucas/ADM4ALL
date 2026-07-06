"use server";

import { revalidatePath } from "next/cache";
import {
  adicionarAula,
  adicionarMaterial,
  atualizarAula,
  atualizarAvatarInstrutor,
  getPresencasPorAula,
  registrarPresencas,
  removerAula,
  removerMaterial,
} from "@/services/instrutorService";
import type {
  AdicionarAulaInput,
  AdicionarMaterialInput,
  AlunoPresenca,
  AtualizarAulaInput,
  AtualizarAvatarInput,
  AulaResumo,
  RegistrarPresencasInput,
} from "@/types/instrutor";

export type ActionResult =
  | { ok: true; mensagem: string }
  | { ok: false; erro: string };

export type PresencasActionResult =
  | { ok: true; alunos: AlunoPresenca[] }
  | { ok: false; erro: string };

export type AvatarActionResult =
  | { ok: true; avatarUrl: string }
  | { ok: false; erro: string };

const traduzirErro = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

export const salvarPresencasAction = async (
  input: RegistrarPresencasInput,
): Promise<ActionResult> => {
  try {
    await registrarPresencas(input);
    revalidatePath("/instrutor/dashboard");
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
    revalidatePath("/instrutor/dashboard");
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
    revalidatePath("/instrutor/dashboard");
    return { ok: true, mensagem: "Material removido com sucesso!" };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao remover o material."),
    };
  }
};

export const adicionarAulaAction = async (
  input: AdicionarAulaInput,
): Promise<ActionResult & { aula?: AulaResumo }> => {
  try {
    const aula = await adicionarAula(input);
    revalidatePath("/instrutor/dashboard");
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
    revalidatePath("/instrutor/dashboard");
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
    revalidatePath("/instrutor/dashboard");
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
  input: AtualizarAvatarInput,
): Promise<AvatarActionResult> => {
  try {
    const avatarUrl = await atualizarAvatarInstrutor(input);
    revalidatePath("/instrutor/dashboard");
    return { ok: true, avatarUrl };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao atualizar a foto."),
    };
  }
};
