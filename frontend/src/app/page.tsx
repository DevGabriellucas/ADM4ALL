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
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-16 bg-linear-to-bl from-brand-dark/90 via-brand-medium/90 to-brand-light/90 p-4 font-poppins xl:flex-row xl:gap-x-20 xl:gap-y-0">
      <section className="flex flex-col items-center justify-center gap-y-8 text-center xl:gap-y-8 xl:text-left">
        <h2 className="font-medium text-3xl tracking-[10%] xl:text-4xl">
          Bem Vindo(a)
        </h2>
        <Image
          src="/login-page-illustration.png"
          alt="Ilustração conceitual de planejamento estratégico e análise de dados do Adminsitração para todos"
          width={601}
          height={328}
          className="hidden xl:block"
        />
      </section>

      <section className="flex min-h-140 w-full max-w-md flex-col rounded-xl bg-[#9FA3C7E5]/60 px-6 py-9 xl:min-h-152 xl:min-w-139">
        <LoginForm
          className="flex w-full flex-col gap-y-4"
          redirectTo={redirectTo}
        />

        <p className="mt-auto pt-6 text-center text-base text-slate-800">
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
