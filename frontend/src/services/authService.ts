import {
  alunoLoginResponseMock,
  coordenadorLoginResponseMock,
  instrutorLoginResponseMock,
} from "@/mocks/authMock";

interface LoginPayload {
  identifier: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

export interface LoginResponse {
  mensagem: string;
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: "aluno" | "instrutor" | "coordenador";
    alunoId: string | null;
    instrutorId: string | null;
    coordenadorId: string | null;
  };
}

export interface ForgotPasswordResponse {
  mensagem: string;
}

interface ApiErrorResponse {
  erro: string;
}

type AuthMockProfile = "aluno" | "instrutor" | "coordenador";

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("URL da API nao configurada.");
  }

  return apiUrl;
};

const getMockLoginResponse = (): LoginResponse => {
  const profile = process.env.NEXT_PUBLIC_AUTH_MOCK_PROFILE as
    | AuthMockProfile
    | undefined;

  if (profile === "instrutor") {
    return instrutorLoginResponseMock;
  }

  if (profile === "coordenador") {
    return coordenadorLoginResponseMock;
  }

  return alunoLoginResponseMock;
};

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  if (process.env.NEXT_PUBLIC_USE_AUTH_MOCK === "true") {
    return getMockLoginResponse();
  }

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

export const forgotPassword = async ({
  email,
}: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
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
