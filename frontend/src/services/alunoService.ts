import {
  alunoAprovadoMock,
  alunoEmProgressoMock,
  alunoReprovadoPorFaltaMock,
} from "@/mocks/alunoDashboardMock";
import { authenticatedRequest } from "@/services/apiClient";
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

export const getAlunoDashboard = async (
  session: AlunoSession,
): Promise<AlunoDashboard> => {
  try {
    return await authenticatedRequest<AlunoDashboard>(
      `/alunos/${session.alunoId}`,
      {
        cache: "no-store",
        fallbackError: "Falha ao carregar o painel do aluno.",
      },
    );
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
