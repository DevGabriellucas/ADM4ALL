"use server";

import { authenticatedFileRequest } from "@/services/apiClient";
import { downloadMaterialAluno } from "@/services/alunoService";
import type { AuthenticatedFileResponse } from "@/services/apiClient";

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
