import { getApiUrl } from "@/services/apiUrl";
import type {
  ActivateAccountPayload,
  ActivateAccountResponse,
  ActivationTokenResponse,
} from "@/types/auth";
import { SERVER_UNAVAILABLE_MESSAGE } from "@/utils/getErrorMessage";

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
  let response: Response;

  // Mesma forma dos outros servicos (`cadastroService`): navegador sem rede ou
  // servidor do Next fora do ar falham aqui, antes de existir resposta para
  // ler.
  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: data.identifier,
        password: data.password,
      }),
    });
  } catch {
    throw new Error(SERVER_UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(
      // A recusa legitima ("E-mail, CPF ou senha incorretos...", "Muitas
      // tentativas...", "Sua conta nao esta ativa...") vem do backend e e lida
      // aqui pelo campo `erro`. Esta reserva cobre apenas resposta sem JSON
      // legivel, que e servidor com problema — nunca credencial errada.
      await readApiError(response, SERVER_UNAVAILABLE_MESSAGE),
    );
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
