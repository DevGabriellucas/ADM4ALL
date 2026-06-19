interface LoginPayload {
  identifier: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

export interface LoginResponse {
  mensagem?: string;
  aluno?: {
    nome?: string;
  };
}

export interface ForgotPasswordResponse {
  mensagem?: string;
}

// TODO: substituir este tipo genérico por tipos específicos
// quando o contrato real das APIs estiver definido.
//
// Por enquanto, como ainda não sabemos exatamente se a API retorna
// "mensagem", "erro", "message", "aluno", "token", etc.,
// mantemos um tipo flexível para evitar adivinhar o contrato final.
type ApiResponse = {
  mensagem?: string;
  erro?: string;
  message?: string;
  aluno?: {
    nome?: string;
  };
};

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("URL da API não configurada.");
  }

  return apiUrl;
};

// TODO: quando o backend tiver respostas padronizadas,
// podemos trocar este parse genérico por tipos mais precisos
// para cada endpoint da API.
//
// Esta função evita que a aplicação quebre caso a API retorne:
// - corpo vazio;
// - resposta não JSON;
// - erro inesperado no parse.
const parseJson = async (response: Response): Promise<ApiResponse | null> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// TODO: quando a API padronizar o formato de erro,
// por exemplo sempre retornando { erro: string },
// podemos simplificar esta função.
const getApiErrorMessage = (
  data: ApiResponse | null,
  fallbackMessage: string,
) => {
  return data?.erro ?? data?.message ?? data?.mensagem ?? fallbackMessage;
};

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: data.identifier,
      password: data.password,
    }),
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, "Falha ao realizar login."));
  }

  return {
    mensagem: result?.mensagem ?? "Login realizado com sucesso.",
    aluno: result?.aluno,
  };
};

export const forgotPassword = async (
  data: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> => {
  const response = await fetch(`${getApiUrl()}/auth/recuperar-senha`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
    }),
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result, "Ocorreu um erro ao processar a solicitação."),
    );
  }

  return {
    mensagem: result?.mensagem,
  };
};
