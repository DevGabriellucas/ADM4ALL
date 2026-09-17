import { BadRequestError } from "../../infrastructure/errors/BadRequestError";

/**
 * Regras de senha do sistema.
 *
 * A tela de cadastro mostra estas mesmas regras na barrinha de forca da senha
 * (frontend/src/utils/senha.ts). Aqui elas voltam a ser conferidas porque o
 * formulario e so a primeira barreira: a API tambem recebe chamada direta.
 * Quem mexer em uma das duas listas precisa mexer na outra.
 */
const TAMANHO_MINIMO_SENHA = 8;

const REGRAS: { erro: string; atende: (senha: string) => boolean }[] = [
  {
    erro: `A senha deve ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres.`,
    atende: (senha) => senha.length >= TAMANHO_MINIMO_SENHA,
  },
  {
    erro: "A senha precisa ter uma letra maiúscula.",
    atende: (senha) => /[A-ZÀ-ÖØ-Þ]/.test(senha),
  },
  {
    erro: "A senha precisa ter uma letra minúscula.",
    atende: (senha) => /[a-zß-öø-ÿ]/.test(senha),
  },
  {
    erro: "A senha precisa ter um número.",
    atende: (senha) => /\d/.test(senha),
  },
  {
    erro: "A senha precisa ter um caractere especial (! @ # $ % & *).",
    atende: (senha) => /[^\dA-Za-zÀ-ÖØ-öø-ÿ]/.test(senha),
  },
];

/** Lanca BadRequestError na primeira regra que a senha nao cumprir. */
export const validarSenhaForte = (senha: string | undefined | null): void => {
  const valor = senha ?? "";
  const falha = REGRAS.find((regra) => !regra.atende(valor));

  if (falha) {
    throw new BadRequestError(falha.erro);
  }
};
