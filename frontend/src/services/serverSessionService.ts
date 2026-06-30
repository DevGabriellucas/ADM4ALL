import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAMES,
  type SessionProfile,
} from "@/services/sessionService";

export interface ServerSession {
  token: string;
  perfil: SessionProfile;
  usuarioId: string;
  alunoId?: string;
  instrutorId?: string;
  coordenadorId?: string;
}

export const getServerSession = async (): Promise<ServerSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAMES.token)?.value;
  const perfil = cookieStore.get(SESSION_COOKIE_NAMES.perfil)?.value;
  const usuarioId = cookieStore.get(SESSION_COOKIE_NAMES.usuarioId)?.value;

  if (
    !token ||
    !usuarioId ||
    (perfil !== "aluno" &&
      perfil !== "instrutor" &&
      perfil !== "coordenador" &&
      perfil !== "admin")
  ) {
    return null;
  }

  return {
    token,
    perfil,
    usuarioId,
    alunoId: cookieStore.get(SESSION_COOKIE_NAMES.alunoId)?.value,
    instrutorId: cookieStore.get(SESSION_COOKIE_NAMES.instrutorId)?.value,
    coordenadorId: cookieStore.get(SESSION_COOKIE_NAMES.coordenadorId)?.value,
  };
};

export const getAlunoSession = async () => {
  const session = await getServerSession();

  if (!session || session.perfil !== "aluno" || !session.alunoId) {
    return null;
  }

  return {
    token: session.token,
    usuarioId: session.usuarioId,
    alunoId: session.alunoId,
  };
};
