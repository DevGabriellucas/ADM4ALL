"use server";

import { revalidatePath } from "next/cache";
import {
  atualizarAvatarAluno,
  downloadMaterialAluno,
  removerAvatarAluno,
} from "@/services/alunoService";
import type { AuthenticatedFileResponse } from "@/services/apiClient";
import { authenticatedFileRequest } from "@/services/apiClient";
import type { ArquivoUpload } from "@/types/instrutor";
import { mensagemDeErroDeAction } from "@/utils/erroDeAction";

export async function baixarCertificadoAlunoAction(): Promise<AuthenticatedFileResponse> {
  return await authenticatedFileRequest(
    "/alunos/me/certificado/pdf",
    "Nao foi possivel baixar o certificado. Tente novamente.",
  );
}

export async function baixarMaterialAlunoAction(
  materialId: string,
): Promise<AuthenticatedFileResponse> {
  return await downloadMaterialAluno(materialId);
}

type ResultadoAvatar =
  | { ok: true; mensagem: string; avatarUrl?: string }
  | { ok: false; erro: string };

const mensagemDeErro = (error: unknown, padrao: string) =>
  mensagemDeErroDeAction(error, padrao);

export async function salvarFotoAlunoAction(
  arquivo: ArquivoUpload,
): Promise<ResultadoAvatar> {
  try {
    const { avatarUrl } = await atualizarAvatarAluno(arquivo);
    revalidatePath("/aluno/dashboard");
    return { ok: true, mensagem: "Foto de perfil atualizada!", avatarUrl };
  } catch (error) {
    return {
      ok: false,
      erro: mensagemDeErro(error, "Falha ao atualizar a foto de perfil."),
    };
  }
}

export async function removerFotoAlunoAction(): Promise<ResultadoAvatar> {
  try {
    await removerAvatarAluno();
    revalidatePath("/aluno/dashboard");
    return { ok: true, mensagem: "Foto de perfil removida." };
  } catch (error) {
    return {
      ok: false,
      erro: mensagemDeErro(error, "Falha ao remover a foto de perfil."),
    };
  }
}
