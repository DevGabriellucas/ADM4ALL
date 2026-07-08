import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import { getServerSession } from "@/services/serverSessionService";
import type { SessionProfile } from "@/services/sessionService";

interface JwtPayload {
  nome?: string;
  perfil?: string;
}

interface CoordinatorRouteLayoutProps {
  children: ReactNode;
}

const DASHBOARD_POR_PERFIL: Record<SessionProfile, string> = {
  aluno: "/aluno/dashboard",
  instrutor: "/instrutor/dashboard",
  coordenador: "/coordenador/dashboard",
  admin: "/coordenador/dashboard",
};

const decodificarPayloadJwt = (token: string): JwtPayload | null => {
  try {
    const partes = token.split(".");
    if (partes.length !== 3) return null;
    const json = Buffer.from(partes[1], "base64url").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

export default async function CoordinatorRouteLayout({
  children,
}: CoordinatorRouteLayoutProps) {
  const session = await getServerSession();
  const pathname =
    (await headers()).get("x-pathname") ?? "/coordenador/dashboard";

  if (!session) {
    redirect(`/?redirectTo=${encodeURIComponent(pathname)}`);
  }

  if (session.perfil !== "coordenador" && session.perfil !== "admin") {
    redirect(DASHBOARD_POR_PERFIL[session.perfil]);
  }

  const jwtPayload = decodificarPayloadJwt(session.token);
  const nomeUsuario = jwtPayload?.nome ?? "";
  const perfilUsuario = jwtPayload?.perfil ?? session.perfil;

  return (
    <CoordinatorLayout
      nomeUsuario={nomeUsuario}
      perfilUsuario={perfilUsuario}
    >
      {children}
    </CoordinatorLayout>
  );
}
