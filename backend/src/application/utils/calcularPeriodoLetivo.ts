const DATA_REFERENCIA_CORTE_MES = 6;
const DATA_REFERENCIA_CORTE_DIA = 15;

export const PERIODO_REGEX = /^\d{4}\.[12]$/;

export const MENSAGEM_PERIODO_INVALIDO =
  "Use o formato AAAA.P, por exemplo 2026.1 ou 2026.2.";

export const calcularPeriodoLetivoAtual = (dataAtual?: Date): string => {
  const hoje = dataAtual ?? new Date();
  const ano = hoje.getFullYear();

  const mes = hoje.getMonth();
  const dia = hoje.getDate();

  const antesDoCorte =
    mes < DATA_REFERENCIA_CORTE_MES ||
    (mes === DATA_REFERENCIA_CORTE_MES && dia <= DATA_REFERENCIA_CORTE_DIA);

  return `${ano}.${antesDoCorte ? 1 : 2}`;
};
