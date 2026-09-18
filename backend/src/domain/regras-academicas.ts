// Regras academicas do curso. Este arquivo e a unica fonte de verdade dos
// numeros: antes cada repositorio declarava sua propria copia e elas derivaram
// mais de uma vez, fazendo a mesma falta aparecer como 90% numa tela e 50% em
// outra. Mudar a regra aqui muda em todo lugar.

// Frequencia e a proporcao entre o que o aluno fez e o que foi chamado:
// creditos (presenca e justificada) sobre chamadas lancadas, em percentual.
// Cinco presencas em dez chamadas sao 50%.
//
// Duas regras anteriores caíram no caminho. A primeira partia de 100 e so
// descontava, entao aluno sem chamada nenhuma aparecia com frequencia cheia. A
// segunda comecava em zero e fazia cada falta custar dois passos (deixar de
// somar e ainda descontar 10), e cinco de dez davam 0% — numero que ninguem
// explicava olhando a propria lista de presencas. A proporcao resolve as duas:
// conta o que o aluno fez e a falta pesa uma vez so.
//
// A conta em SQL vive em `sql/frequencia.ts`, em uma unica escrita.

// Frequencia igual ou inferior a este valor reprova por falta e bloqueia o
// certificado. So vale com o curso concluido: no meio do periodo a proporcao
// ainda esta sendo formada, e uma falta na primeira semana derrubaria o aluno
// sozinha.
export const FREQUENCIA_MAXIMA_REPROVACAO = 70;

// Concluir o curso com esta frequencia aprova a matricula sozinha.
export const FREQUENCIA_MINIMA_APROVACAO = 80;

/**
 * Quantas aulas tem um periodo letivo completo.
 *
 * Vale para o aviso de periodo cumprido no painel do instrutor e para a aula de
 * encerramento (a decima, onde a presenca e confirmada para a turma inteira).
 *
 * A frequencia NAO depende mais deste numero: virou proporcao sobre as
 * chamadas lancadas, entao turma curta nao reprova mais a turma inteira por
 * nao alcancar a escala — a armadilha que existia enquanto cada aula valia 10
 * pontos fixos.
 */
export const AULAS_POR_PERIODO = 10;

/**
 * Quantas faltas o aluno ainda pode levar sem perder a aprovacao.
 *
 * O painel de risco da coordenacao e a coluna "Situacao" do instrutor
 * classificam por ISTO, e nao por faixa de frequencia: falta ja e definitiva no
 * dia em que acontece, entao serve de alerta desde a primeira semana.
 *
 * A conta: com a chamada toda lancada num periodo cheio, cada falta derruba a
 * frequencia em 100/AULAS_POR_PERIODO pontos. O limite e quantas cabem na folga
 * entre 100% e o minimo da aprovacao. Com 10 aulas e minimo 80: 2 faltas
 * (8 de 10 = 80%, ainda aprova; 7 de 10 = 70%, reprova).
 */
export const FALTAS_TOLERADAS = Math.floor(
  (AULAS_POR_PERIODO * (100 - FREQUENCIA_MINIMA_APROVACAO)) / 100,
);

/**
 * O dia da semana em que a turma tem aula: sabado (0 = domingo ... 6 = sabado).
 *
 * As aulas do projeto acontecem aos sabados, e um periodo letivo sao
 * AULAS_POR_PERIODO sabados. Ate 18/09 o cronograma aceitava qualquer data e a
 * turma de teste ficou com dez aulas em dez dias seguidos — o que fazia a turma
 * encerrar, aprovar todo mundo e liberar certificado numa semana e meia.
 *
 * O periodo letivo da turma (`turmas.periodo_letivo`, "2026.2") continua sendo
 * digitado pela coordenacao: ele nomeia o semestre, nao e derivado das datas.
 * Quem deriva alguma coisa do cronograma e o progresso e o periodo impresso no
 * certificado (ver `periodoDoCronograma` em sql/turma.ts).
 */
export const DIA_DA_SEMANA_DAS_AULAS = 6;

const NOMES_DOS_DIAS = [
  "domingo",
  "segunda-feira",
  "terca-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sabado",
] as const;

/**
 * O dia da semana de uma data "AAAA-MM-DD", ou null se a data nao existir.
 *
 * Le em UTC de proposito. `new Date("2026-09-12")` ja nasce como meia-noite
 * UTC, e `getDay()` a converteria para o fuso do servidor — em UTC-3 isso
 * devolve a sexta-feira anterior, e todo sabado seria recusado.
 */
const diaDaSemanaUtc = (data: string): number | null => {
  const [ano, mes, dia] = data.split("-").map(Number);
  if (!ano || !mes || !dia) return null;

  const referencia = new Date(Date.UTC(ano, mes - 1, dia));
  const existe =
    referencia.getUTCFullYear() === ano &&
    referencia.getUTCMonth() === mes - 1 &&
    referencia.getUTCDate() === dia;

  return existe ? referencia.getUTCDay() : null;
};

/** `null` quando a data serve; a mensagem do erro quando nao serve. */
export const erroDeDiaDeAula = (data: string): string | null => {
  const dia = diaDaSemanaUtc(data);

  if (dia === null) {
    return `${data} nao e uma data valida.`;
  }

  if (dia === DIA_DA_SEMANA_DAS_AULAS) {
    return null;
  }

  return (
    `As aulas acontecem aos ${NOMES_DOS_DIAS[DIA_DA_SEMANA_DAS_AULAS]}s. ` +
    `${data} cai numa ${NOMES_DOS_DIAS[dia]}.`
  );
};
