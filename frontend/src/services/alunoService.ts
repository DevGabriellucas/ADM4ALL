import {
  alunoAprovadoMock,
  alunoEmProgressoMock,
  alunoReprovadoPorFaltaMock,
} from "@/mocks/alunoDashboardMock";
import type { AlunoDashboard } from "@/types/aluno";

type AlunoDashboardMockCase = "emProgresso" | "reprovadoPorFalta" | "aprovado";

// TESTE TEMPORÁRIO:
// Altere este valor para testar os estados visuais da tela.
// Remover esta estrutura quando a rota real da API estiver disponível.
const mockCase = "emProgresso" as AlunoDashboardMockCase;

export const getAlunoDashboard = async (): Promise<AlunoDashboard> => {
  // TODO: substituir este mock por uma chamada real quando a API estiver disponivel.
  if (mockCase === "reprovadoPorFalta") {
    return alunoReprovadoPorFaltaMock;
  }

  if (mockCase === "aprovado") {
    return alunoAprovadoMock;
  }

  return alunoEmProgressoMock;
};
