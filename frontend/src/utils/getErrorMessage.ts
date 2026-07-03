const SERVER_UNAVAILABLE_MESSAGE =
  "Não foi possível acessar o sistema no momento. Tente novamente em alguns instantes.";

const isNetworkError = (error: Error) =>
  /failed to fetch|fetch failed|networkerror|load failed/i.test(error.message);

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      return SERVER_UNAVAILABLE_MESSAGE;
    }

    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
};
