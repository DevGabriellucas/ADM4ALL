import type { AlunoDashboard } from "@/types/aluno";

export type AlunoStatus = "emProgresso" | "reprovadoPorFalta" | "aprovado";

export const getAlunoStatus = (aluno: AlunoDashboard): AlunoStatus => {
  if (aluno.faltas >= 3) {
    return "reprovadoPorFalta";
  }

  if (aluno.aulasConcluidas >= aluno.aulasPlanejadas) {
    return "aprovado";
  }

  return "emProgresso";
};
