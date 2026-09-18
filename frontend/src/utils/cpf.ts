/**
 * Validacao de CPF pelo algoritmo oficial (modulo 11).
 *
 * Conferir apenas a quantidade de digitos deixava passar qualquer sequencia de
 * 11 numeros — e o CPF e um dos identificadores de login, entao um valor
 * invalido so aparece quando o aluno tenta entrar e nao consegue.
 *
 * O login tambem confere o digito verificador desde 18/09: digitado errado, o
 * CPF nao bate com conta nenhuma, e a mensagem "CPF inválido" no proprio campo
 * explica melhor do que "Credenciais inválidas" depois de enviar. Toda conta do
 * sistema nasce com CPF validado no cadastro, entao ninguem fica de fora.
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

// Mesma pergunta, mas no meio da digitacao: o que esta no campo AINDA pode
// virar um CPF? Serve para a mascara aparecer a partir do primeiro numero sem
// estragar e-mail institucional que comeca por matricula (20231234@...): assim
// que a primeira letra ou o @ chegam, o campo sai do modo CPF.
export const pareceCpfEmDigitacao = (valor: string) => {
  const limpo = valor.trim();
  return limpo !== "" && /^[\d.\s-]+$/.test(limpo);
};
