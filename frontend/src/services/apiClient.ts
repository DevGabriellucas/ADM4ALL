import { getServerSession } from "@/services/serverSessionService";

interface AuthenticatedRequestInit extends RequestInit {
  fallbackError?: string;
}

interface ApiErrorBody {
  erro?: string;
  mensagem?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("URL da API nao configurada.");
  }

  return apiUrl.replace(/\/$/, "");
};

const readErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as ApiErrorBody;
    return data.erro ?? data.mensagem ?? fallback;
  } catch {
    return fallback;
  }
};

export const authenticatedRequest = async <T>(
  path: string,
  options: AuthenticatedRequestInit = {},
): Promise<T> => {
  const session = await getServerSession();

  if (!session) {
    throw new ApiError("Sessao nao encontrada.", 401);
  }

  const {
    fallbackError = "Nao foi possivel concluir a solicitacao.",
    ...init
  } = options;
  const headers = new Headers(init.headers);

  headers.set("Authorization", `Bearer ${session.token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    throw new ApiError(
      await readErrorMessage(response, "Sessao expirada ou invalida."),
      401,
    );
  }

  if (response.status === 403) {
    throw new ApiError(
      await readErrorMessage(
        response,
        "Voce nao possui permissao para esta acao.",
      ),
      403,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, fallbackError),
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};
