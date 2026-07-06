import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "@/services/serverSessionService";
import type { SessionProfile } from "@/services/sessionService";

interface InstrutorRouteLayoutProps {
  children: ReactNode;
}

const DASHBOARD_POR_PERFIL: Record<SessionProfile, string> = {
  aluno: "/aluno/dashboard",
  instrutor: "/instrutor/dashboard",
  coordenador: "/coordenador/dashboard",
  admin: "/coordenador/dashboard",
};

export default async function InstrutorRouteLayout({
  children,
}: InstrutorRouteLayoutProps) {
  const session = await getServerSession();
  const pathname =
    (await headers()).get("x-pathname") ?? "/instrutor/dashboard";

  if (!session) {
    redirect(`/?redirectTo=${encodeURIComponent(pathname)}`);
  }

  if (session.perfil !== "instrutor" && session.perfil !== "admin") {
    redirect(DASHBOARD_POR_PERFIL[session.perfil]);
  }

  return <>{children}</>;
}
