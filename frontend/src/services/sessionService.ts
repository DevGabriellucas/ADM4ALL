export const SESSION_MAX_AGE_IN_SECONDS = 60 * 60 * 8;

export type SessionProfile = "aluno" | "instrutor" | "coordenador" | "admin";

export const SESSION_COOKIE_NAMES = {
  token: "adm4all_token",
  perfil: "adm4all_perfil",
  usuarioId: "adm4all_usuario_id",
  alunoId: "adm4all_aluno_id",
  instrutorId: "adm4all_instrutor_id",
  coordenadorId: "adm4all_coordenador_id",
} as const;
