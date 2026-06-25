interface LoginPayload {
  identifier: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

export interface LoginResponse {
  mensagem: string;
  aluno: {
    nome: string;
    matricula: string | null;
    cursoDeExtensao: {
      nome_curso: string;
      qtd_faltas: number;
      qtd_total_aulas: number;
      qtd_aulas_concluidas: number;
    };
  };
}

export interface ForgotPasswordResponse {
  mensagem: string;
}

interface ApiErrorResponse {
  erro: string;
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("URL da API não configurada.");
  }

  return apiUrl;
};

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  try {
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

    if (!response.ok) {
      const error: ApiErrorResponse = await response.json();
      throw new Error(error.erro);
    }

    const result: LoginResponse = await response.json();

    return result;
  } catch (error: unknown) {
    console.error("Erro ao tentar realizar login", error);
    throw error;
  }
};

export const forgotPassword = async (
  { email }: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> => {
  try {
    const response = await fetch(`${getApiUrl()}/auth/recuperar-senha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    if (!response.ok) {
      const error: ApiErrorResponse = await response.json();
      throw new Error(error.erro);
    }

    const result: ForgotPasswordResponse = await response.json();

    return result;
  } catch (error: unknown) {
    console.error("Erro ao tentar recuperar senha", error);
    throw error;
  }
};
