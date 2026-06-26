interface LoginPayload {
  identifier: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  novaSenha: string;
}

export interface LoginResponse {
  mensagem?: string;
  token?: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    perfil: "aluno" | "instrutor" | "coordenador" | "admin";
    alunoId: string | null;
    instrutorId: string | null;
    coordenadorId: string | null;
  };
  aluno?: {
    id?: string | null;
    nome?: string;
  };
}

export interface ForgotPasswordResponse {
  mensagem?: string;
}

export interface ResetPasswordResponse {
  mensagem?: string;
}

type ApiResponse = LoginResponse &
  ForgotPasswordResponse &
  ResetPasswordResponse & {
    erro?: string;
    message?: string;
  };

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("URL da API nao configurada.");
  }

  return apiUrl;
};

const parseJson = async (response: Response): Promise<ApiResponse | null> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

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
    token: result?.token,
    usuario: result?.usuario,
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
      getApiErrorMessage(result, "Ocorreu um erro ao processar a solicitacao."),
    );
  }

  return {
    mensagem: result?.mensagem,
  };
};

export const resetPassword = async (
  data: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  const response = await fetch(`${getApiUrl()}/auth/redefinir-senha`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: data.token,
      novaSenha: data.novaSenha,
    }),
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result, "Não foi possível redefinir a senha."),
    );
  }

  return {
    mensagem: result?.mensagem,
  };
};
