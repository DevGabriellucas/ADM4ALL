const SERVER_UNAVAILABLE_MESSAGE =
  "Não foi possível acessar o sistema no momento. Tente novamente em alguns instantes.";

const isNetworkError = (error: Error) =>
  /failed to fetch|fetch failed|networkerror|load failed/i.test(error.message);

const MENSAGEM_PADRAO_POR_ERRO: Array<[RegExp, string]> = [
  [
    /Unexpected token|JSON|SyntaxError/i,
    "O sistema recebeu uma resposta inválida. Tente novamente.",
  ],
  [
    /timeout|timed out|aborted/i,
    "A operação demorou mais que o esperado. Tente novamente.",
  ],
  [
    /internal server error|500|service unavailable|502|503/i,
    "O sistema está temporariamente indisponível. Tente novamente em instantes.",
  ],
];

const normalizarMensagem = (mensagem: string) => {
  const encontrada = MENSAGEM_PADRAO_POR_ERRO.find(([padrao]) =>
    padrao.test(mensagem),
  );
  return encontrada?.[1] ?? mensagem;
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      return SERVER_UNAVAILABLE_MESSAGE;
    }

    return normalizarMensagem(error.message);
  }

  if (typeof error === "string") {
    return normalizarMensagem(error);
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
};
