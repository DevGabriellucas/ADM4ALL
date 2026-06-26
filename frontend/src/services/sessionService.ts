import type { LoginResponse } from "@/services/authService";

const SESSION_MAX_AGE_IN_SECONDS = 60 * 60 * 8;
const SECURE_COOKIE = process.env.NODE_ENV === "production" ? "; Secure" : "";

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
  document.cookie = `${name}=${encodeURIComponent(value)}; ${COOKIE_OPTIONS}`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${SECURE_COOKIE}`;
};

export const saveSession = ({ token, usuario }: LoginResponse) => {
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
