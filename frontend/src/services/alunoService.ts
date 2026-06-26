import {
  alunoAprovadoMock,
  alunoEmProgressoMock,
  alunoReprovadoPorFaltaMock,
} from "@/mocks/alunoDashboardMock";
import type { getAlunoSession } from "@/services/serverSessionService";
import type { AlunoDashboard } from "@/types/aluno";

type AlunoDashboardMockCase = "emProgresso" | "reprovadoPorFalta" | "aprovado";
type AlunoSession = NonNullable<Awaited<ReturnType<typeof getAlunoSession>>>;

const usarMockEmDesenvolvimento = process.env.NODE_ENV !== "production";

// MOCK TEMPORARIO:
// Altere este valor somente para testar os estados visuais da tela do aluno.
// Em producao, o service nao deve cair em mock: ele deve usar a API real.
const mockCase = "emProgresso" as AlunoDashboardMockCase;

const getAlunoDashboardMock = (): AlunoDashboard => {
  if (mockCase === "reprovadoPorFalta") {
    return alunoReprovadoPorFaltaMock;
  }

  if (mockCase === "aprovado") {
    return alunoAprovadoMock;
  }

  return alunoEmProgressoMock;
};

const montarHeaders = (session: AlunoSession): HeadersInit => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.token}`,
  };
};

export const getAlunoDashboard = async (
  session: AlunoSession,
): Promise<AlunoDashboard> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    if (usarMockEmDesenvolvimento) {
      console.warn(
        "[alunoService] NEXT_PUBLIC_API_URL ausente; usando mock temporario do dashboard do aluno.",
      );
      return getAlunoDashboardMock();
    }

    throw new Error("URL da API nao configurada.");
  }

  try {
    const response = await fetch(
      `${baseUrl}/alunos/${session.alunoId}`,
      {
        headers: montarHeaders(session),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`A API respondeu com status ${response.status}.`);
    }

    return (await response.json()) as AlunoDashboard;
  } catch (error) {
    if (usarMockEmDesenvolvimento) {
      console.warn(
        "[alunoService] falha ao consultar API; usando mock temporario do dashboard do aluno.",
        error,
      );
      return getAlunoDashboardMock();
    }

    throw error;
  }
};
