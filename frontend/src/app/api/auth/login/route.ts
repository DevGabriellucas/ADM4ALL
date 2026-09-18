import { type NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/services/apiUrl";
import type { LoginResponse } from "@/services/authService";
import {
  SESSION_COOKIE_NAMES,
  SESSION_MAX_AGE_IN_SECONDS,
} from "@/services/sessionService";

interface BackendLoginResponse extends LoginResponse {
  token: string;
}

interface ApiErrorResponse {
  erro?: string;
  mensagem?: string;
}

const cookieOptions = {
  httpOnly: true,
  maxAge: SESSION_MAX_AGE_IN_SECONDS,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

const limparCookiesSessao = (response: NextResponse) => {
  for (const cookieName of Object.values(SESSION_COOKIE_NAMES)) {
    response.cookies.set(cookieName, "", {
      ...cookieOptions,
      expires: new Date(0),
      maxAge: 0,
    });
  }
};

const readApiError = async (response: Response, fallback: string) => {
  try {
    const error = (await response.json()) as ApiErrorResponse;
    return error.erro ?? error.mensagem ?? fallback;
  } catch {
    return fallback;
  }
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const identifier =
    typeof body?.identifier === "string" ? body.identifier : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const apiResponse = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
    cache: "no-store",
  });

  if (!apiResponse.ok) {
    return NextResponse.json(
      {
        erro: await readApiError(
          apiResponse,
          // So aparece se a API responder sem corpo de erro; o texto normal vem
          // do backend (AuthUseCase). Os dois precisam dizer a mesma coisa.
          "E-mail, CPF ou senha incorretos. Confira os dados e tente de novo.",
        ),
      },
      { status: apiResponse.status },
    );
  }

  const resultado = (await apiResponse.json()) as BackendLoginResponse;
  const { token, ...publicResult } = resultado;
  const response = NextResponse.json(publicResult);

  limparCookiesSessao(response);
  response.cookies.set(SESSION_COOKIE_NAMES.token, token, cookieOptions);
  response.cookies.set(
    SESSION_COOKIE_NAMES.perfil,
    resultado.usuario.perfil,
    cookieOptions,
  );
  response.cookies.set(
    SESSION_COOKIE_NAMES.usuarioId,
    resultado.usuario.id,
    cookieOptions,
  );

  if (resultado.usuario.alunoId) {
    response.cookies.set(
      SESSION_COOKIE_NAMES.alunoId,
      resultado.usuario.alunoId,
      cookieOptions,
    );
  }

  if (resultado.usuario.instrutorId) {
    response.cookies.set(
      SESSION_COOKIE_NAMES.instrutorId,
      resultado.usuario.instrutorId,
      cookieOptions,
    );
  }

  if (resultado.usuario.coordenadorId) {
    response.cookies.set(
      SESSION_COOKIE_NAMES.coordenadorId,
      resultado.usuario.coordenadorId,
      cookieOptions,
    );
  }

  return response;
}
