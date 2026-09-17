export const MATRICULA_STATUS = {
  EM_ANDAMENTO: "em_andamento",
  APROVADO: "aprovado",
  REPROVADO_FALTA: "reprovado_falta",
  CANCELADO: "cancelado",
} as const;

export const FREQUENCIA_MINIMA_APROVACAO = 80;

/**
 * Frequencia igual ou inferior a isto ja reprova por falta. Os cards de
 * "Alunos em risco" usam o mesmo limite do backend para nao apontarem risco
 * num aluno que a regra ainda considera regular.
 */
export const FREQUENCIA_LIMITE_RISCO = 70;

export type MatriculaStatus =
  (typeof MATRICULA_STATUS)[keyof typeof MATRICULA_STATUS];

export type MatriculaStatusTone = "black" | "green" | "red" | "slate";

export const matriculaStatusLabel: Record<MatriculaStatus, string> = {
  em_andamento: "Em andamento",
  aprovado: "Aprovado",
  reprovado_falta: "Reprovado por falta",
  cancelado: "Cancelado",
};

export const matriculaStatusTone: Record<MatriculaStatus, MatriculaStatusTone> =
  {
    em_andamento: "black",
    aprovado: "green",
    reprovado_falta: "red",
    cancelado: "slate",
  };

const matriculaStatusValues = new Set<string>(Object.values(MATRICULA_STATUS));

export const isMatriculaStatus = (value: unknown): value is MatriculaStatus =>
  typeof value === "string" && matriculaStatusValues.has(value);

export const getMatriculaStatusInfo = (status: MatriculaStatus) => ({
  label: matriculaStatusLabel[status],
  tone: matriculaStatusTone[status],
});
