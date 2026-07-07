import type {
  ActivateAccountPayload,
  ActivateAccountResponse,
  ActivationTokenResponse,
} from "@/types/auth";

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
  mensagem: string;
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: "aluno" | "instrutor" | "coordenador" | "admin";
    alunoId: string | null;
    instrutorId: string | null;
    coordenadorId: string | null;
  };
}

export interface ForgotPasswordResponse {
  mensagem: string;
}

export interface ResetPasswordResponse {
  mensagem: string;
}

interface ApiErrorResponse {
  erro?: string;
  mensagem?: string;
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("URL da API nao configurada.");
  }

  return apiUrl;
};

const readApiError = async (response: Response, fallback: string) => {
  try {
    const error = (await response.json()) as ApiErrorResponse;
    return error.erro ?? error.mensagem ?? fallback;
  } catch {
    return fallback;
  }
};

export const validateActivationToken = async (
  token: string,
): Promise<ActivationTokenResponse> => {
  const response = await fetch(
    `${getApiUrl()}/auth/ativacoes/${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível validar o link."),
    );
  }

  return (await response.json()) as ActivationTokenResponse;
};

export const activateAccount = async (
  token: string,
  payload: ActivateAccountPayload,
): Promise<ActivateAccountResponse> => {
  const response = await fetch(
    `${getApiUrl()}/auth/ativacoes/${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível ativar a conta."),
    );
  }

  return (await response.json()) as ActivateAccountResponse;
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

  if (!response.ok) {
    throw new Error(await readApiError(response, "Credenciais invalidas."));
  }

  return (await response.json()) as LoginResponse;
};

export const forgotPassword = async ({
  email,
}: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
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
    throw new Error(
      await readApiError(response, "Nao foi possivel recuperar a senha."),
    );
  }

  return (await response.json()) as ForgotPasswordResponse;
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

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Nao foi possivel redefinir a senha."),
    );
  }

  return (await response.json()) as ResetPasswordResponse;
};
