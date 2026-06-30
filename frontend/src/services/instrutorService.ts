// ATENCAO: modulo de uso exclusivo do servidor. Ele le cookies de sessao
// e por isso so deve ser importado por Server Components ou Server Actions,
// nunca por componentes "use client".
import { instrutorDashboardMock } from "@/mocks/instrutorDashboardMock";
import { authenticatedRequest } from "@/services/apiClient";
import { getServerSession } from "@/services/serverSessionService";
import type {
  AdicionarAulaInput,
  AdicionarMaterialInput,
  AlunoPresenca,
  AtualizarAvatarInput,
  AulaResumo,
  InstrutorDashboard,
  MaterialResumo,
  RegistrarPresencasInput,
} from "@/types/instrutor";

const INSTRUTOR_ID_DEMO =
  process.env.INSTRUTOR_ID ?? "20000000-0000-0000-0000-000000000001";

export const getInstrutorDashboard = async (): Promise<InstrutorDashboard> => {
  const session = await getServerSession();
  const instrutorId =
    session?.instrutorId ?? process.env.INSTRUTOR_ID ?? INSTRUTOR_ID_DEMO;

  // Sem sessao configurada caimos no mock, assim a tela renderiza em
  // desenvolvimento mesmo sem o backend no ar (igual a tela do aluno).
  if (!session?.token || !instrutorId) {
    return instrutorDashboardMock;
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
    console.warn(
      "[instrutorService] usando dados mockados; falha ao consultar a API:",
      error,
    );
    return instrutorDashboardMock;
  }
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
    fallbackError: "Falha ao registrar a presenca.",
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
        urlArquivo: input.urlArquivo ?? null,
        tamanhoBytes: input.tamanhoBytes ?? null,
        publicadoPorId: input.publicadoPorId ?? null,
        arquivo: input.arquivo ?? null,
      }),
      fallbackError: "Falha ao adicionar o material.",
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

export const removerAula = async (
  turmaId: string,
  aulaId: string,
): Promise<void> => {
  await authenticatedRequest<unknown>(`/turmas/${turmaId}/aulas/${aulaId}`, {
    method: "DELETE",
    fallbackError: "Falha ao remover a aula.",
  });
};

export const getPresencasPorAula = async (
  turmaId: string,
  aulaId: string,
): Promise<AlunoPresenca[]> => {
  const data = await authenticatedRequest<{ alunos: AlunoPresenca[] }>(
    `/turmas/${turmaId}/aulas/${aulaId}/presencas`,
    {
      cache: "no-store",
      fallbackError: "Falha ao consultar a presenca da aula.",
    },
  );

  return data.alunos;
};

export const atualizarAvatarInstrutor = async (
  input: AtualizarAvatarInput,
): Promise<string> => {
  const data = await authenticatedRequest<{ avatarUrl: string }>(
    `/instrutores/${input.instrutorId}/avatar`,
    {
      method: "POST",
      body: JSON.stringify({ arquivo: input.arquivo }),
      fallbackError: "Falha ao atualizar a foto.",
    },
  );

  return data.avatarUrl;
};
