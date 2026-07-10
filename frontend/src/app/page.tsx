import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getServerSession } from "@/services/serverSessionService";
import type { SessionProfile } from "@/services/sessionService";

const DASHBOARD_POR_PERFIL: Record<SessionProfile, string> = {
  aluno: "/aluno/dashboard",
  instrutor: "/instrutor/dashboard",
  coordenador: "/coordenador/dashboard",
  admin: "/coordenador/dashboard",
};

interface HomePageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const session = await getServerSession();

  if (session) {
    redirect(DASHBOARD_POR_PERFIL[session.perfil]);
  }

  const { redirectTo } = await searchParams;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-5 overflow-y-auto overflow-x-hidden bg-linear-to-bl from-brand-dark/90 via-brand-medium/90 to-brand-light/90 p-4 py-6 font-poppins sm:gap-y-7 xl:flex-row xl:gap-x-20 xl:gap-y-0">
      <section className="flex w-full max-w-[300px] flex-col items-center justify-center gap-y-4 text-center sm:max-w-md xl:max-w-xl xl:items-start xl:gap-y-8 xl:text-left">
        <h2 className="font-medium text-3xl tracking-[0.1em] xl:text-4xl">
          Bem-vindo(a)
        </h2>
        <Image
          src="/login-page-illustration.png"
          alt="Ilustração conceitual de planejamento estratégico e análise de dados do Administração para todos"
          width={601}
          height={328}
          priority
          className="w-full max-w-[280px] object-contain sm:max-w-sm xl:max-w-xl"
        />
      </section>

      <section className="flex w-full max-w-[300px] flex-col rounded-xl bg-[#9FA3C7E5]/60 px-5 py-6 shadow-sm sm:max-w-md sm:px-6 sm:py-8 xl:max-h-[calc(100vh-2rem)] xl:max-w-xl xl:overflow-y-auto">
        <LoginForm
          className="flex w-full flex-col gap-y-4"
          redirectTo={redirectTo}
        />

        <p className="mt-5 text-center text-base text-slate-800 sm:mt-6">
          Ainda não é aluno?{" "}
          <Link
            href="/cadastro"
            className="font-bold text-[#524ABF] underline underline-offset-2 transition-colors duration-200 hover:brightness-125"
          >
            Cadastre-se
          </Link>
        </p>
      </section>
    </main>
  );
}
