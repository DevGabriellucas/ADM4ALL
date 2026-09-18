export const MATRICULA_STATUS = {
  EM_ANDAMENTO: "em_andamento",
  APROVADO: "aprovado",
  REPROVADO_FALTA: "reprovado_falta",
  CANCELADO: "cancelado",
} as const;

export const FREQUENCIA_MINIMA_APROVACAO = 80;

/**
 * Quantas faltas o aluno ainda pode levar sem perder a aprovacao. Espelha
 * FALTAS_TOLERADAS do backend (`domain/regras-academicas.ts`), que desde 18/09
 * calcula a folga entre 100% e o minimo da aprovacao: com 10 aulas e minimo de
 * 80%, duas faltas.
 *
 * As telas classificam risco por ISTO, e nao por faixa de frequencia: a falta
 * ja e definitiva no dia em que acontece, entao serve de alerta desde a
 * primeira semana.
 */
export const FALTAS_TOLERADAS = 2;

export type MatriculaStatus =
  (typeof MATRICULA_STATUS)[keyof typeof MATRICULA_STATUS];

// Subconjunto dos tons do CoordinatorStatusBadge. Os mesmos que a tabela de
// turmas usa — ver matriculaStatusTone.
export type MatriculaStatusTone = "blue" | "green" | "red" | "slate";

export const matriculaStatusLabel: Record<MatriculaStatus, string> = {
  em_andamento: "Em andamento",
  aprovado: "Aprovado",
  reprovado_falta: "Reprovado por falta",
  cancelado: "Cancelado",
};

// As mesmas cores do status de TURMA, para as duas colunas "Status" da
// coordenacao lerem igual. "Em andamento" era uma pilula preta chapada aqui e
// azul clara na tabela de turmas: na mesma tela, o mesmo estado parecia duas
// coisas diferentes.
export const matriculaStatusTone: Record<MatriculaStatus, MatriculaStatusTone> =
  {
    em_andamento: "blue",
    aprovado: "green",
    reprovado_falta: "red",
    cancelado: "red",
  };

const matriculaStatusValues = new Set<string>(Object.values(MATRICULA_STATUS));

export const isMatriculaStatus = (value: unknown): value is MatriculaStatus =>
  typeof value === "string" && matriculaStatusValues.has(value);

export const getMatriculaStatusInfo = (status: MatriculaStatus) => ({
  label: matriculaStatusLabel[status],
  tone: matriculaStatusTone[status],
});
