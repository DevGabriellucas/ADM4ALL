// ATENCAO: modulo de uso exclusivo do servidor. Ele le cookies de sessao
// e por isso so deve ser importado por Server Components ou Server Actions,
// nunca por componentes "use client".
import { redirect } from "next/navigation";
import {
  ApiError,
  authenticatedFileRequest,
  authenticatedRequest,
} from "@/services/apiClient";
import { getServerSession } from "@/services/serverSessionService";
import type {
  AdicionarAulaInput,
  AdicionarMaterialInput,
  AlunoPresenca,
  ArquivoUpload,
  AtualizarAulaInput,
  AulaResumo,
  InstrutorDashboard,
  MaterialResumo,
  RegistrarPresencasInput,
  TurmaDashboard,
} from "@/types/instrutor";

const isErroAutenticacao = (error: unknown): boolean => {
  return (
    error instanceof ApiError && (error.status === 401 || error.status === 403)
  );
};

export const getInstrutorDashboard = async (): Promise<InstrutorDashboard> => {
  const session = await getServerSession();
  const instrutorId = session?.instrutorId;

  // Sessao vencida ou sem vinculo de instrutor manda a pessoa para o login, do
  // mesmo jeito que o authenticatedRequest faz. Lancar ApiError aqui derrubava
  // o Server Component e mostrava "Nao foi possivel carregar a area do
  // instrutor" com digest opaco, em vez da tela de entrar.
  if (!session?.token || !instrutorId) {
    redirect("/logout");
  }

  try {
    return await authenticatedRequest<InstrutorDashboard>(
      `/instrutores/${instrutorId}/dashboard`,
      {
        cache: "no-store",
        fallbackError: "Falha ao carregar o painel do instrutor.",
      },
    );
  } catch (error) {
    if (isErroAutenticacao(error)) {
      throw error;
    }

    throw error;
  }
};

/**
 * Painel de uma turma especifica. O instrutor chega ao dele por
 * getInstrutorDashboard; a coordenacao escolhe a turma e cai aqui. As duas
 * pontas leem os mesmos numeros, calculados no backend.
 */
export const getPainelDaTurma = async (
  turmaId: string,
): Promise<TurmaDashboard> => {
  return await authenticatedRequest<TurmaDashboard>(
    `/turmas/${turmaId}/painel`,
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar o painel da turma.",
    },
  );
};

/**
 * A chamada abre na mesma aula que a barra do topo mostra, e acompanha a virada
 * dela. Quando nao ha mais aula pela frente, cai na aula de referencia para a
 * ultima chamada ainda poder ser lancada.
 *
 * Os alunos que vem do painel tem o status da aula de referencia. Se a aula
 * aberta for outra, buscar de novo: sem isso a tela abriria com a marcacao de
 * uma aula diferente da que esta selecionada.
 */
export const resolverChamadaAberta = async (
  painel: InstrutorDashboard | TurmaDashboard,
): Promise<{ aulaSelecionada: AulaResumo | null; alunos: AlunoPresenca[] }> => {
  const aulaSelecionada = painel.aulaAtual ?? painel.aulaReferencia;
  const alunosDoPainel = Array.isArray(painel.alunos) ? painel.alunos : [];

  if (
    !painel.turma ||
    !aulaSelecionada ||
    aulaSelecionada.id === painel.aulaReferencia?.id
  ) {
    return { aulaSelecionada, alunos: alunosDoPainel };
  }

  return {
    aulaSelecionada,
    alunos: await getPresencasPorAula(painel.turma.id, aulaSelecionada.id),
  };
};

export const registrarPresencas = async (
  input: RegistrarPresencasInput,
): Promise<void> => {
  await authenticatedRequest<unknown>(`/turmas/${input.turmaId}/presencas`, {
    method: "POST",
    body: JSON.stringify({
      aulaId: input.aulaId,
      registros: input.registros,
    }),
    fallbackError: "Falha ao registrar a presença.",
  });
};

export const adicionarMaterial = async (
  input: AdicionarMaterialInput,
): Promise<MaterialResumo> => {
  return await authenticatedRequest<MaterialResumo>(
    `/turmas/${input.turmaId}/materiais`,
    {
      method: "POST",
      body: JSON.stringify({
        titulo: input.titulo,
        tipo: input.tipo,
        descricao: input.descricao ?? null,
        urlArquivo: input.urlArquivo ?? null,
        tamanhoBytes: input.tamanhoBytes ?? null,
        publicadoPorId: input.publicadoPorId ?? null,
        aulaId: input.aulaId ?? null,
        visibilidade: input.visibilidade ?? "visivel",
        arquivo: input.arquivo ?? null,
      }),
      fallbackError: "Falha ao adicionar o material.",
    },
  );
};

export const atualizarMaterialVisibilidade = async (
  turmaId: string,
  materialId: string,
  visibilidade: "visivel" | "oculto",
): Promise<MaterialResumo> => {
  return await authenticatedRequest<MaterialResumo>(
    `/turmas/${turmaId}/materiais/${materialId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ visibilidade }),
      fallbackError: "Falha ao atualizar a visibilidade do material.",
    },
  );
};

export const removerMaterial = async (
  turmaId: string,
  materialId: string,
): Promise<void> => {
  await authenticatedRequest<unknown>(
    `/turmas/${turmaId}/materiais/${materialId}`,
    {
      method: "DELETE",
      fallbackError: "Falha ao remover o material.",
    },
  );
};

export const adicionarAula = async (
  input: AdicionarAulaInput,
): Promise<AulaResumo> => {
  return await authenticatedRequest<AulaResumo>(
    `/turmas/${input.turmaId}/aulas`,
    {
      method: "POST",
      body: JSON.stringify({
        titulo: input.titulo,
        data: input.data,
        horaInicio: input.horaInicio ?? null,
        horaFim: input.horaFim ?? null,
      }),
      fallbackError: "Falha ao adicionar a aula.",
    },
  );
};

export const atualizarAula = async (
  input: AtualizarAulaInput,
): Promise<AulaResumo> => {
  return await authenticatedRequest<AulaResumo>(
    `/turmas/${input.turmaId}/aulas/${input.aulaId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        titulo: input.titulo,
        data: input.data,
        horaInicio: input.horaInicio,
        horaFim: input.horaFim,
        status: input.status,
      }),
      fallbackError: "Falha ao atualizar a aula.",
    },
  );
};

export const removerAula = async (
  turmaId: string,
  aulaId: string,
): Promise<void> => {
  await authenticatedRequest<unknown>(`/turmas/${turmaId}/aulas/${aulaId}`, {
    method: "DELETE",
    fallbackError: "Falha ao remover a aula.",
  });
};

export const atualizarAvatarInstrutor = async (
  instrutorId: string,
  arquivo: ArquivoUpload,
): Promise<{ avatarUrl: string }> => {
  return await authenticatedRequest<{ avatarUrl: string }>(
    `/instrutores/${instrutorId}/avatar`,
    {
      method: "POST",
      body: JSON.stringify({ arquivo }),
      fallbackError: "Falha ao atualizar a foto de perfil.",
    },
  );
};

export const removerAvatarInstrutor = async (
  instrutorId: string,
): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(
    `/instrutores/${instrutorId}/avatar`,
    {
      method: "DELETE",
      fallbackError: "Falha ao remover a foto de perfil.",
    },
  );
};

export const getPresencasPorAula = async (
  turmaId: string,
  aulaId: string,
): Promise<AlunoPresenca[]> => {
  const data = await authenticatedRequest<{ alunos: AlunoPresenca[] }>(
    `/turmas/${turmaId}/aulas/${aulaId}/presencas`,
    {
      cache: "no-store",
      fallbackError: "Falha ao consultar a presença da aula.",
    },
  );

  return data.alunos;
};

export const downloadMaterialTurma = async (
  turmaId: string,
  materialId: string,
) => {
  return await authenticatedFileRequest(
    `/turmas/${turmaId}/materiais/${materialId}/download`,
    "Falha ao baixar o material da turma.",
  );
};
