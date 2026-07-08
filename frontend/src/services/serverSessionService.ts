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

interface JwtPayloadParcial {
  exp?: unknown;
}

// Decodifica o payload do JWT (parte do meio) apenas para inspecionar a
// expiracao. Nao valida assinatura - isso continua sendo responsabilidade do
// backend via JwtService.verificar. O objetivo aqui e apenas evitar UX
// quebrada com token obviamente expirado/malformado no Server Component.
const isTokenExpirado = (token: string): boolean => {
  const partes = token.split(".");
  if (partes.length !== 3 || !partes[0] || !partes[1] || !partes[2]) {
    return true;
  }

  try {
    const json = Buffer.from(partes[1], "base64url").toString("utf8");
    const payload = JSON.parse(json) as JwtPayloadParcial;

    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return true;
    }

    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

export const getServerSession = async (): Promise<ServerSession | null> => {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAMES.token)?.value;
  const rawPerfil = cookieStore.get(SESSION_COOKIE_NAMES.perfil)?.value;
  const rawUsuarioId = cookieStore.get(SESSION_COOKIE_NAMES.usuarioId)?.value;

  const tryDecode = (v?: string) => {
    if (!v) return undefined;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };

  const token = tryDecode(rawToken);
  const perfil = tryDecode(rawPerfil);
  const usuarioId = tryDecode(rawUsuarioId);

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

  if (isTokenExpirado(token)) {
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
