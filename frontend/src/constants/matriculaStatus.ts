export const MATRICULA_STATUS = {
  EM_ANDAMENTO: "em_andamento",
  APROVADO: "aprovado",
  REPROVADO_FALTA: "reprovado_falta",
  CANCELADO: "cancelado",
} as const;

export type MatriculaStatus =
  (typeof MATRICULA_STATUS)[keyof typeof MATRICULA_STATUS];

export type MatriculaStatusTone = "blue" | "green" | "red" | "slate";

export const matriculaStatusLabel: Record<MatriculaStatus, string> = {
  em_andamento: "Em andamento",
  aprovado: "Aprovado",
  reprovado_falta: "Reprovado por falta",
  cancelado: "Cancelado",
};

export const matriculaStatusTone: Record<MatriculaStatus, MatriculaStatusTone> =
  {
    em_andamento: "blue",
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
