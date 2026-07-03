import type { LoginResponse } from "@/services/authService";

export const SESSION_MAX_AGE_IN_SECONDS = 60 * 60 * 8;
const SECURE_COOKIE = process.env.NODE_ENV === "production" ? "; Secure" : "";

export type SessionProfile = "aluno" | "instrutor" | "coordenador" | "admin";

export interface ClientSession {
  token: string;
  perfil: SessionProfile;
  usuarioId: string;
  alunoId?: string;
  instrutorId?: string;
  coordenadorId?: string;
}

export const SESSION_COOKIE_NAMES = {
  token: "adm4all_token",
  perfil: "adm4all_perfil",
  usuarioId: "adm4all_usuario_id",
  alunoId: "adm4all_aluno_id",
  instrutorId: "adm4all_instrutor_id",
  coordenadorId: "adm4all_coordenador_id",
} as const;

const COOKIE_OPTIONS = `path=/; max-age=${SESSION_MAX_AGE_IN_SECONDS}; SameSite=Lax${SECURE_COOKIE}`;

const setCookie = (name: string, value: string) => {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie acessivel pelo frontend faz parte do escopo do MVP.
  document.cookie = `${name}=${encodeURIComponent(value)}; ${COOKIE_OPTIONS}`;
};

const removeCookie = (name: string) => {
  // biome-ignore lint/suspicious/noDocumentCookie: A remocao precisa usar a mesma estrategia da gravacao no MVP.
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${SECURE_COOKIE}`;
};

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!cookie) {
    return undefined;
  }

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return undefined;
  }
};

const isSessionProfile = (value: string): value is SessionProfile => {
  return ["aluno", "instrutor", "coordenador", "admin"].includes(value);
};

export const getSession = (): ClientSession | null => {
  const token = getCookie(SESSION_COOKIE_NAMES.token);
  const perfil = getCookie(SESSION_COOKIE_NAMES.perfil);
  const usuarioId = getCookie(SESSION_COOKIE_NAMES.usuarioId);

  if (!token || !perfil || !usuarioId || !isSessionProfile(perfil)) {
    return null;
  }

  return {
    token,
    perfil,
    usuarioId,
    alunoId: getCookie(SESSION_COOKIE_NAMES.alunoId),
    instrutorId: getCookie(SESSION_COOKIE_NAMES.instrutorId),
    coordenadorId: getCookie(SESSION_COOKIE_NAMES.coordenadorId),
  };
};

export const saveSession = ({ token, usuario }: LoginResponse) => {
  clearSession();

  setCookie(SESSION_COOKIE_NAMES.token, token);
  setCookie(SESSION_COOKIE_NAMES.perfil, usuario.perfil);
  setCookie(SESSION_COOKIE_NAMES.usuarioId, usuario.id);

  if (usuario.alunoId) {
    setCookie(SESSION_COOKIE_NAMES.alunoId, usuario.alunoId);
  }

  if (usuario.instrutorId) {
    setCookie(SESSION_COOKIE_NAMES.instrutorId, usuario.instrutorId);
  }

  if (usuario.coordenadorId) {
    setCookie(SESSION_COOKIE_NAMES.coordenadorId, usuario.coordenadorId);
  }
};

export const clearSession = () => {
  removeCookie(SESSION_COOKIE_NAMES.token);
  removeCookie(SESSION_COOKIE_NAMES.perfil);
  removeCookie(SESSION_COOKIE_NAMES.usuarioId);
  removeCookie(SESSION_COOKIE_NAMES.alunoId);
  removeCookie(SESSION_COOKIE_NAMES.instrutorId);
  removeCookie(SESSION_COOKIE_NAMES.coordenadorId);
};
