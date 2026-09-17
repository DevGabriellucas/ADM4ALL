/**
 * Regras de senha do sistema, em um lugar so.
 *
 * O mesmo conjunto alimenta tres coisas: a validacao dos formularios (zod), a
 * barrinha de forca que o aluno ve enquanto digita e a lista de requisitos
 * abaixo dela. O backend repete estas regras em AlunoUseCase.criptografarSenha
 * e em ActivationUseCase.confirmar — quem mexer aqui precisa mexer la tambem.
 */
export interface RequisitoSenha {
  id: string;
  texto: string;
  /** Mensagem usada pelo formulario quando o requisito falha. */
  erro: string;
  atende: (senha: string) => boolean;
}

export const TAMANHO_MINIMO_SENHA = 8;

export const REQUISITOS_SENHA: RequisitoSenha[] = [
  {
    id: "tamanho",
    texto: `Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres`,
    erro: `A senha deve ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres.`,
    atende: (senha) => senha.length >= TAMANHO_MINIMO_SENHA,
  },
  {
    id: "maiuscula",
    texto: "1 letra maiúscula",
    erro: "A senha precisa ter uma letra maiúscula.",
    atende: (senha) => /[A-ZÀ-ÖØ-Þ]/.test(senha),
  },
  {
    id: "minuscula",
    texto: "1 letra minúscula",
    erro: "A senha precisa ter uma letra minúscula.",
    atende: (senha) => /[a-zß-öø-ÿ]/.test(senha),
  },
  {
    id: "numero",
    texto: "1 número",
    erro: "A senha precisa ter um número.",
    atende: (senha) => /\d/.test(senha),
  },
  {
    id: "especial",
    texto: "1 caractere especial (! @ # $ % & *)",
    erro: "A senha precisa ter um caractere especial (! @ # $ % & *).",
    atende: (senha) => /[^\dA-Za-zÀ-ÖØ-öø-ÿ]/.test(senha),
  },
];

export type NivelSenha = "vazia" | "fraca" | "media" | "forte";

export interface ForcaSenha {
  nivel: NivelSenha;
  /** Rotulo mostrado ao lado da barra. */
  rotulo: string;
  /** Quantos dos requisitos a senha ja cumpre. */
  atendidos: number;
  total: number;
  idsAtendidos: string[];
}

const ROTULOS: Record<NivelSenha, string> = {
  vazia: "",
  fraca: "Fraco",
  media: "Médio",
  forte: "Forte",
};

export const avaliarSenha = (senha: string): ForcaSenha => {
  const idsAtendidos = REQUISITOS_SENHA.filter((requisito) =>
    requisito.atende(senha),
  ).map((requisito) => requisito.id);

  // Verde so quando a senha ja passa em tudo: a barra combina com o que o
  // formulario aceita, em vez de prometer "forte" numa senha que sera recusada.
  let nivel: NivelSenha = "fraca";
  if (senha.length === 0) {
    nivel = "vazia";
  } else if (idsAtendidos.length === REQUISITOS_SENHA.length) {
    nivel = "forte";
  } else if (idsAtendidos.length >= 3) {
    nivel = "media";
  }

  return {
    nivel,
    rotulo: ROTULOS[nivel],
    atendidos: idsAtendidos.length,
    total: REQUISITOS_SENHA.length,
    idsAtendidos,
  };
};

/** Primeira regra que a senha nao cumpre, para o erro do formulario. */
export const primeiroErroSenha = (senha: string): string | null =>
  REQUISITOS_SENHA.find((requisito) => !requisito.atende(senha))?.erro ?? null;
