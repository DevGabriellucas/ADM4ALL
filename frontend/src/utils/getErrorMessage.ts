/**
 * Texto unico para "o servidor nao respondeu, ou respondeu quebrado".
 *
 * Exportado porque as camadas que falam com a API precisam do MESMO texto na
 * reserva delas: sem isso cada uma inventava o seu, e a do login inventava
 * justamente a de credencial errada — a tela acusava a senha quando o backend
 * e que estava fora do ar.
 */
export const SERVER_UNAVAILABLE_MESSAGE =
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
    // "Erro interno do servidor." e o que o `errorMiddleware` do backend
    // devolve em todo 500, e e o texto que chegava cru na tela do cadastro
    // publico. Esta linha so falava ingles ("internal server error"), que o
    // backend nunca escreve — a rede de protecao existia e nao pegava nada.
    /erro interno do servidor|internal server error|500|service unavailable|502|503/i,
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
