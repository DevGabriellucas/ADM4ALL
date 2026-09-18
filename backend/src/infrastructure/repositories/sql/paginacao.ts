import type { Paginacao } from "../../../domain/paginacao";

// Total de linhas que o filtro alcanca, contado na MESMA consulta que traz a
// pagina. Uma segunda consulta so para contar dobraria as idas ao banco e podia
// discordar da primeira se algo mudasse no meio.
//
// Vem como `total_geral` em toda linha; com zero linhas, nao vem nenhuma, e o
// chamador entende isso como total 0.
export const TOTAL_DA_CONSULTA = "COUNT(*) OVER() AS total_geral";

// Placeholders de LIMIT/OFFSET a partir do proximo parametro livre da consulta.
export function limiteEDeslocamento(primeiroParametro: number): string {
  return `LIMIT $${primeiroParametro} OFFSET $${primeiroParametro + 1}`;
}

export function valoresDeLimiteEDeslocamento(
  paginacao: Paginacao,
): [number, number] {
  return [paginacao.porPagina, (paginacao.pagina - 1) * paginacao.porPagina];
}

// Le o `total_geral` da primeira linha. Sem linhas, o total e zero.
export function totalDasLinhas(linhas: { total_geral?: unknown }[]): number {
  const primeira = linhas[0];
  if (!primeira) return 0;

  return Number(primeira.total_geral ?? 0);
}
