import { DESCONTO_FREQUENCIA_POR_FALTA } from "../../../domain/regras-academicas";

// Trechos de SQL da regra de frequencia. Existem para que a conta tenha UMA
// escrita: ela ja esteve colada em catorze consultas e derivou em quatro
// versoes diferentes, fazendo a mesma falta aparecer como 90% no painel do
// aluno e 50% no card de risco da coordenacao.
//
// Os apelidos recebidos aqui sao sempre literais escritos no proprio codigo das
// consultas, nunca entrada de usuario.

// Falta que conta contra o aluno. A justificada fica de fora por definicao.
export function faltasNaoJustificadas(alias: string): string {
  return `COUNT(${alias}.id) FILTER (
    WHERE NOT ${alias}.presente AND NOT ${alias}.justificada
  )`;
}

// Presenca de verdade, sem a justificada.
//
// A justificada e gravada com presente = TRUE (decisao de 16/09: ela recebe
// credito de presenca). Um COUNT FILTER (presente) puro passa a contar a mesma
// linha duas vezes, uma em "Presencas" e outra em "Justificadas", e as colunas
// da tela param de fechar com o total de chamadas.
//
// Qualificar com NOT justificada tambem le corretamente as linhas antigas,
// gravadas como presente = FALSE antes daquela decisao.
export function presencasEfetivas(alias: string): string {
  return `COUNT(${alias}.id) FILTER (
    WHERE ${alias}.presente AND NOT ${alias}.justificada
  )`;
}

// Frequencia a partir de uma contagem de faltas ja calculada.
export function frequenciaDeFaltas(expressaoFaltas: string): string {
  return `GREATEST(0, 100 - (${expressaoFaltas}) * ${DESCONTO_FREQUENCIA_POR_FALTA})`;
}

// Frequencia de UM aluno, para consultas agrupadas por matricula.
//
// Agrupar por turma e aplicar esta expressao soma as faltas de todo mundo antes
// de descontar, e uma turma com dez faltas no total marca 0%. Quando o recorte
// e a turma, calcule por matricula numa subconsulta e faca AVG por cima.
export function frequenciaPorMatricula(alias: string): string {
  return frequenciaDeFaltas(faltasNaoJustificadas(alias));
}
