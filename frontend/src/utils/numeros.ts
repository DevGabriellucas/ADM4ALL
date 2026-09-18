/**
 * Deixa so os digitos do que foi digitado.
 *
 * Os campos numericos dos formularios da coordenacao (carga horaria do curso,
 * capacidade da turma) sao `type="text"`: com `type="number"` a setinha de
 * incremento e a roda do mouse mudavam o valor sem querer, e o campo ainda
 * aceitava "e", "+" e "-" em alguns navegadores. Filtrando na digitacao, o
 * valor continua servindo para Number() na hora de enviar.
 */
export const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");
