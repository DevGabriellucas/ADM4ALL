import type { AulaResumo } from "@/types/instrutor";

// Cada periodo letivo fecha com 10 aulas. O mesmo numero vale no backend, que
// preenche a chamada pendente quando a decima aula e marcada como realizada.
export const AULAS_POR_PERIODO = 10;

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

const TURNOS = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
} as const;

export type TurnoDaTurma = (typeof TURNOS)[keyof typeof TURNOS];

const HORA_FIM_DA_MANHA = 12;
const HORA_FIM_DA_TARDE = 18;

const turnoDoHorario = (horaInicio: string): TurnoDaTurma | null => {
  const hora = Number(horaInicio.slice(0, 2));

  if (!Number.isInteger(hora)) return null;
  if (hora < HORA_FIM_DA_MANHA) return TURNOS.manha;
  if (hora < HORA_FIM_DA_TARDE) return TURNOS.tarde;

  return TURNOS.noite;
};

/**
 * Em que turno a turma tem aula, lido do cronograma.
 *
 * O turno vem do horario que o instrutor (ou a coordenacao) digita ao montar as
 * aulas, e nao da coluna `turmas.turno`: aquela e preenchida uma vez, no
 * cadastro, e fica com o valor padrao enquanto o cronograma real diz outra
 * coisa. Vale o turno que mais se repete, entao uma aula remarcada para outro
 * horario nao muda o rotulo da turma.
 *
 * Aula cancelada nao conta, e cronograma sem horario devolve null — cabe a
 * quem chama decidir o que mostrar no lugar.
 */
export const turnoDoCronograma = (
  cronograma: AulaResumo[] | undefined,
): TurnoDaTurma | null => {
  if (!Array.isArray(cronograma)) return null;

  const contagem = new Map<TurnoDaTurma, number>();

  for (const aula of cronograma) {
    if (aula.status === "cancelada" || !aula.horaInicio) continue;

    const turno = turnoDoHorario(aula.horaInicio);
    if (!turno) continue;

    contagem.set(turno, (contagem.get(turno) ?? 0) + 1);
  }

  let escolhido: TurnoDaTurma | null = null;
  let maior = 0;

  for (const [turno, total] of contagem) {
    if (total > maior) {
      escolhido = turno;
      maior = total;
    }
  }

  return escolhido;
};

/**
 * A data que a barra "Data da Aula" mostra no topo das telas de turma.
 *
 * Primeiro a aula que esta por vir; quando o cronograma ja acabou, a aula de
 * referencia — a mais proxima de hoje, que e a mesma que a chamada abre. Lendo
 * so `aulaAtual`, a barra ficava vazia justamente na turma que ja deu todas as
 * aulas, e quem olhava via "-" com dez aulas cadastradas.
 */
export const dataDaAulaEmFoco = (
  painel:
    | {
        aulaAtual: AulaResumo | null;
        aulaReferencia: AulaResumo | null;
      }
    | null
    | undefined,
): string | null =>
  painel?.aulaAtual?.data ?? painel?.aulaReferencia?.data ?? null;

/**
 * O dia da semana das aulas: sabado. A regra tambem e conferida no backend
 * (`erroDeDiaDeAula`, em domain/regras-academicas.ts), que e quem de fato
 * recusa. Aqui ela existe so para o instrutor ver o problema antes de salvar.
 * Quem mexer numa das duas precisa mexer na outra.
 */
const DIA_DA_SEMANA_DAS_AULAS = 6;

const NOMES_DOS_DIAS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
] as const;

/**
 * `null` quando a data cai num sabado (ou esta vazia, que e o campo ainda nao
 * preenchido); o aviso quando cai em outro dia.
 *
 * Le em UTC: "2026-09-12" ja nasce como meia-noite UTC e `getDay()` a
 * converteria para o fuso do navegador — em UTC-3 todo sabado viraria sexta.
 */
export const avisoDeDiaDeAula = (data: string): string | null => {
  if (!data) return null;

  const [ano, mes, dia] = data.split("-").map(Number);
  if (!ano || !mes || !dia) return null;

  const diaDaSemana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
  if (diaDaSemana === DIA_DA_SEMANA_DAS_AULAS) return null;

  return `As aulas acontecem aos sábados. Esta data cai numa ${NOMES_DOS_DIAS[diaDaSemana]}.`;
};
