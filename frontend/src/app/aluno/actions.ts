"use server";

import { downloadMaterialAluno } from "@/services/alunoService";
import type { AuthenticatedFileResponse } from "@/services/apiClient";
import { authenticatedFileRequest } from "@/services/apiClient";

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
