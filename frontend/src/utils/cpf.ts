/**
 * Validacao de CPF pelo algoritmo oficial (modulo 11).
 *
 * Conferir apenas a quantidade de digitos deixava passar qualquer sequencia de
 * 11 numeros — e o CPF e um dos identificadores de login, entao um valor
 * invalido so aparece quando o aluno tenta entrar e nao consegue.
 *
 * O login continua exigindo apenas os 11 digitos: cobrar o digito verificador
 * ali nao acrescenta seguranca e impediria de tentar entrar quem ja foi
 * cadastrado antes desta regra.
 */

const calcularDigito = (base: number[]): number => {
  const soma = base.reduce(
    (acumulado, digito, indice) =>
      acumulado + digito * (base.length + 1 - indice),
    0,
  );

  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
};

export const somenteDigitosCpf = (valor: string) => valor.replace(/\D/g, "");

export const formatarCpf = (valor: string) =>
  somenteDigitosCpf(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

// Num campo que aceita e-mail OU CPF, diz se o valor INTEIRO e um CPF.
//
// Precisa olhar o valor completo, nunca o que foi digitado ate agora: decidindo
// tecla a tecla, um e-mail institucional que comeca por matricula numerica
// (20231234@aluno.unipe.br) era mascarado como CPF antes do @ chegar, virava
// 202.312.34@aluno.unipe.br e nao batia com conta nenhuma.
export const pareceCpf = (valor: string) =>
  /^[\d.\s-]+$/.test(valor.trim()) && somenteDigitosCpf(valor).length === 11;

export const isCpfValido = (valor: string): boolean => {
  const cpf = somenteDigitosCpf(valor);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  const base = cpf.slice(0, 9).split("").map(Number);
  const primeiroDigito = calcularDigito(base);

  if (primeiroDigito !== Number(cpf[9])) return false;

  const segundoDigito = calcularDigito([...base, primeiroDigito]);

  return segundoDigito === Number(cpf[10]);
};
