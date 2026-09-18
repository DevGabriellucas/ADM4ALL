// Regras academicas do curso. Este arquivo e a unica fonte de verdade dos
// numeros: antes cada repositorio declarava sua propria copia e elas derivaram
// mais de uma vez, fazendo a mesma falta aparecer como 90% numa tela e 50% em
// outra. Mudar a regra aqui muda em todo lugar.

// Frequencia comeca em ZERO e cada chamada lancada move o ponteiro nesta
// fatia: presenca soma, justificada soma igual, falta subtrai. Com as dez
// aulas do periodo, quem nao falta fecha em 100%.
//
// A regra anterior partia de 100 e so descontava, entao aluno sem nenhuma
// chamada aparecia com frequencia cheia — o painel anunciava 100% para quem
// nao tinha assistido a uma aula. Comecar do zero faz o numero contar o que
// o aluno fez, e nao o que ele ainda nao perdeu.
export const PESO_FREQUENCIA_POR_AULA = 10;

// Frequencia igual ou inferior a este valor reprova por falta e bloqueia o
// certificado. So vale com o curso concluido: no meio do periodo todo mundo
// esta abaixo disto por definicao, porque a contagem comeca em zero.
export const FREQUENCIA_MAXIMA_REPROVACAO = 70;

// Concluir o curso com esta frequencia aprova a matricula sozinha.
export const FREQUENCIA_MINIMA_APROVACAO = 80;

/**
 * Quantas aulas tem um periodo letivo completo. E a escala em que a frequencia
 * foi desenhada: PESO_FREQUENCIA_POR_AULA x AULAS_POR_PERIODO = 100%.
 *
 * ATENCAO A TURMA CURTA. Desde 18/09 a turma conclui pelo progresso — todas as
 * aulas nao canceladas realizadas — e nao mais por ter cumprido este bloco. O
 * peso da frequencia, porem, continua fixo. Num cronograma com menos aulas que
 * isto, o aluno com presenca perfeita nao alcanca os 80% da aprovacao: uma
 * turma de 5 aulas fecha com todo mundo em 50% e, como 50 <= 70, a reavaliacao
 * marca a turma inteira como reprovada por falta.
 *
 * Para a turma real do projeto, de 10 aulas, as duas escalas coincidem e nao ha
 * problema. Se um dia existir turma mais curta de proposito, o peso precisa
 * virar proporcional ao cronograma dela (100 / total de aulas nao canceladas)
 * em vez deste valor fixo.
 */
export const AULAS_POR_PERIODO = 10;

/**
 * Quantas faltas o aluno ainda pode levar sem perder a aprovacao.
 *
 * O painel de risco da coordenacao e a coluna "Situacao" do instrutor
 * classificam por ISTO, e nao por faixas de frequencia. A frequencia agora se
 * acumula: no meio do periodo ate quem nunca faltou esta bem abaixo de 80%, e
 * a faixa "abaixo de 75 = risco" pintava a turma inteira de vermelho na
 * primeira semana. Falta ja e definitiva no dia em que acontece, entao serve
 * de alerta desde o comeco.
 *
 * A conta: aprovar exige (creditos - faltas) * peso >= minimo. Com a chamada
 * toda lancada num periodo cheio, cada falta custa dois passos — deixa de
 * somar e ainda subtrai — entao o limite e a folga entre o total e o minimo
 * dividida por dois pesos. Com 10 aulas, peso 10 e minimo 80: 1 falta.
 */
export const FALTAS_TOLERADAS = Math.floor(
  (AULAS_POR_PERIODO * PESO_FREQUENCIA_POR_AULA - FREQUENCIA_MINIMA_APROVACAO) /
    (2 * PESO_FREQUENCIA_POR_AULA),
);
