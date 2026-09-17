import type { AulaResumo } from "@/types/instrutor";

// Cada periodo letivo fecha com 10 aulas. O mesmo numero vale no backend, que
// preenche a chamada pendente quando a decima aula e marcada como realizada.
export const AULAS_POR_PERIODO = 10;

/**
 * Avanca o periodo letivo em semestres: 2026.1 -> 2026.2 -> 2027.1 -> 2027.2.
 * E a mesma sequencia que o resto do sistema usa no formato AAAA.P.
 */
export const avancarPeriodoLetivo = (
  periodo: string,
  semestres: number,
): string | null => {
  const partida = /^(\d{4})\.([12])$/.exec(periodo);

  if (!partida || semestres <= 0) {
    return null;
  }

  const ano = Number(partida[1]);
  const semestre = Number(partida[2]);
  // Trabalha em semestres corridos desde o ano 0 para nao errar a virada de ano.
  const totalSemestres = ano * 2 + (semestre - 1) + semestres;

  return `${Math.floor(totalSemestres / 2)}.${(totalSemestres % 2) + 1}`;
};

/**
 * Quantos blocos de 10 aulas a turma ja fechou. Cada bloco encerrado empurra o
 * periodo letivo um semestre para a frente no aviso do painel.
 */
export const blocosConcluidos = (
  cronograma: AulaResumo[] | undefined,
): number => {
  if (!Array.isArray(cronograma)) {
    return 0;
  }

  const realizadas = cronograma.filter(
    (aula) => aula.status === "realizada",
  ).length;

  return Math.floor(realizadas / AULAS_POR_PERIODO);
};
