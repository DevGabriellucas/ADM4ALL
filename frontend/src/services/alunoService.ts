import {
  authenticatedFileRequest,
  authenticatedRequest,
} from "@/services/apiClient";
import type {
  AlunoDashboard,
  AlunoDashboardResponse,
  MateriaisAlunoResponse,
  MateriaisVisiveisAlunoResponse,
  MaterialVisivelAluno,
} from "@/types/aluno";
import type { ArquivoUpload } from "@/types/instrutor";

export const getAlunoDashboard = async (): Promise<AlunoDashboard> => {
  const resposta = await authenticatedRequest<AlunoDashboardResponse>(
    "/alunos/me/dashboard",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar o painel do aluno.",
    },
  );

  return {
    nome: resposta.nome,
    matricula: resposta.matricula,
    avatarUrl: resposta.avatarUrl,
    semMatricula: resposta.semMatricula ?? false,
    curso: resposta.cursoDeExtensao.nomeCurso,
    faltas: resposta.cursoDeExtensao.qtdFaltas,
    aulasPlanejadas: resposta.cursoDeExtensao.qtdTotalAulas,
    aulasConcluidas: resposta.cursoDeExtensao.qtdAulasConcluidas,
    progresso: resposta.cursoDeExtensao.progresso,
    status: resposta.cursoDeExtensao.status,
    cursoConcluido: resposta.cursoDeExtensao.cursoConcluido,
    certificadoLiberado: resposta.cursoDeExtensao.certificadoLiberado,
    certificadoDisponivel: resposta.certificadoDisponivel,
    certificadoUrl: resposta.certificadoUrl,
    frequencia: resposta.frequencia,
    proximaAula: resposta.proximaAula,
    historicoPresencas: resposta.historicoPresencas ?? [],
    calendarioTurma: resposta.calendarioTurma ?? [],
    comunicados: resposta.comunicados ?? [],
  };
};

export const getMateriaisAluno = async (): Promise<MateriaisAlunoResponse> => {
  return await authenticatedRequest<MateriaisAlunoResponse>(
    "/alunos/me/materiais",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar os materiais.",
    },
  );
};

export const getMateriaisVisiveisAluno = async (): Promise<
  MaterialVisivelAluno[]
> => {
  const resposta = await authenticatedRequest<MateriaisVisiveisAlunoResponse>(
    "/alunos/me/materiais",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar os materiais da turma.",
    },
  );

  return Array.isArray(resposta.materiais) ? resposta.materiais : [];
};

export const downloadMaterialAluno = async (materialId: string) => {
  return await authenticatedFileRequest(
    `/alunos/me/materiais/${materialId}/download`,
    "Falha ao baixar o material.",
  );
};

export const atualizarAvatarAluno = async (
  arquivo: ArquivoUpload,
): Promise<{ avatarUrl: string }> => {
  return await authenticatedRequest<{ avatarUrl: string }>(
    "/alunos/me/avatar",
    {
      method: "POST",
      body: JSON.stringify({ arquivo }),
      fallbackError: "Falha ao atualizar a foto de perfil.",
    },
  );
};

export const removerAvatarAluno = async (): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>("/alunos/me/avatar", {
    method: "DELETE",
    fallbackError: "Falha ao remover a foto de perfil.",
  });
};
