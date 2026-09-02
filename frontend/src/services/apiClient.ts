import { redirect } from "next/navigation";
import { getApiUrl } from "@/services/apiUrl";
import { getServerSession } from "@/services/serverSessionService";

interface AuthenticatedRequestInit extends RequestInit {
  fallbackError?: string;
}

interface ApiErrorBody {
  erro?: string;
  mensagem?: string;
}

export interface AuthenticatedFileResponse {
  base64: string;
  contentType: string;
  fileName: string;
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

// Sessao ausente ou recusada pelo backend nao e erro de tela: e usuario
// deslogado. Lancar ApiError nesses casos derrubava o Server Component
// inteiro, e o Next respondia com "Ocorreu um erro na renderizacao dos
// Componentes do Servidor" mais um digest opaco, em vez de levar a pessoa
// de volta ao login. Vale para todas as telas autenticadas.
//
// O destino precisa ser /logout, nunca "/": um token com assinatura invalida
// mas exp no futuro ainda passa pelo getServerSession, entao a raiz mandaria
// o usuario de volta ao dashboard e o ciclo recomecaria. /logout limpa os
// cookies antes de cair na tela de login, quebrando o laco.
const ROTA_LOGOUT = "/logout";

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
    redirect(ROTA_LOGOUT);
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

  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      "Nao foi possivel conectar a API. Verifique se o backend esta rodando e se as URLs do .env estao corretas.",
      503,
    );
  }

  if (response.status === 401) {
    redirect(ROTA_LOGOUT);
  }

  if (response.status === 403) {
    throw new ApiError(
      await readErrorMessage(
        response,
        "Você não possui permissão para esta ação.",
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

export const authenticatedFileRequest = async (
  path: string,
  fallbackError = "Nao foi possivel baixar o arquivo.",
): Promise<AuthenticatedFileResponse> => {
  const session = await getServerSession();

  if (!session) {
    redirect(ROTA_LOGOUT);
  }

  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${session.token}` },
    });
  } catch {
    throw new ApiError(
      "Nao foi possivel conectar a API para baixar o arquivo.",
      503,
    );
  }

  if (response.status === 401) {
    redirect(ROTA_LOGOUT);
  }

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, fallbackError),
      response.status,
    );
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const fileNameMatch = disposition.match(/filename="([^"]+)"/i);
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    base64: buffer.toString("base64"),
    contentType: response.headers.get("content-type") ?? "application/pdf",
    fileName: fileNameMatch?.[1] ?? "certificado.pdf",
  };
};
