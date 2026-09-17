// Regras academicas do curso. Este arquivo e a unica fonte de verdade dos
// numeros: antes cada repositorio declarava sua propria copia e elas derivaram
// mais de uma vez, fazendo a mesma falta aparecer como 90% numa tela e 50% em
// outra. Mudar a regra aqui muda em todo lugar.

// Frequencia comeca em 100 e cada falta nao justificada desconta esta fatia.
// Nao e proporcao de presencas sobre chamadas lancadas: no comeco do periodo,
// com poucas chamadas, a proporcao oscila demais para servir de nota.
export const DESCONTO_FREQUENCIA_POR_FALTA = 10;

// Frequencia igual ou inferior a este valor reprova por falta e bloqueia o
// certificado. Com o desconto acima, e a terceira falta nao justificada.
export const FREQUENCIA_MAXIMA_REPROVACAO = 70;

// Concluir o curso com esta frequencia aprova a matricula sozinha.
export const FREQUENCIA_MINIMA_APROVACAO = 80;

// Faixa intermediaria: ainda nao reprova, mas entra no painel de atencao da
// coordenacao. So vale para matricula em andamento e com chamada lancada.
export const FREQUENCIA_ATENCAO = 75;

// Um periodo letivo tem este numero de aulas. E o minimo para a turma poder ser
// considerada concluida: sem esta guarda, a primeira aula marcada como
// realizada formava a turma inteira e emitia certificados reais.
export const AULAS_POR_PERIODO = 10;
