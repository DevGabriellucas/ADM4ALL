"use server";

import { revalidatePath } from "next/cache";
import {
  adicionarMaterial,
  registrarPresencas,
} from "@/services/instrutorService";
import type {
  AdicionarMaterialInput,
  RegistrarPresencasInput,
} from "@/types/instrutor";

export type ActionResult =
  | { ok: true; mensagem: string }
  | { ok: false; erro: string };

const traduzirErro = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

export const salvarPresencasAction = async (
  input: RegistrarPresencasInput,
): Promise<ActionResult> => {
  try {
    await registrarPresencas(input);
    revalidatePath("/instrutor");
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
    revalidatePath("/instrutor");
    return { ok: true, mensagem: "Material adicionado com sucesso!" };
  } catch (error) {
    return {
      ok: false,
      erro: traduzirErro(error, "Falha ao adicionar o material."),
    };
  }
};
