import { alunoDashboardMock } from "@/mocks/alunoDashboardMock";
import type { AlunoDashboard } from "@/types/aluno";

export const getAlunoDashboard = async (): Promise<AlunoDashboard> => {
  // TODO: substituir este mock por uma chamada real quando a API estiver disponivel.
  return alunoDashboardMock;
};
