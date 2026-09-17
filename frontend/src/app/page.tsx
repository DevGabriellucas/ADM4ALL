import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { LoginForm } from "@/components/LoginForm";
import { Notificacao } from "@/components/shared/Notificacao";
import { getServerSession } from "@/services/serverSessionService";
import type { SessionProfile } from "@/services/sessionService";

const DASHBOARD_POR_PERFIL: Record<SessionProfile, string> = {
  aluno: "/aluno/dashboard",
  instrutor: "/instrutor/dashboard",
  coordenador: "/coordenador/dashboard",
  admin: "/coordenador/dashboard",
};

// Avisos que outras telas mandam para ca pela URL: o cadastro publico ao
// terminar (?cadastro=...) e a saida do sistema (?logout=ok). Assim o usuario
// chega no login ja sabendo o que aconteceu, no mesmo padrao de aviso do resto
// do sistema.
const AVISOS_DE_CADASTRO = {
  "ativacao-enviada": {
    tipo: "sucesso",
    texto:
      "Cadastro realizado! Enviamos para o seu e-mail o link de ativação da conta. Abra o link para ativar e depois entre aqui. Se não encontrar, procure na caixa de spam.",
  },
  "sem-email": {
    tipo: "aviso",
    texto:
      "Cadastro realizado, mas não foi possível enviar o e-mail de ativação. Fale com a coordenação do curso para receber um novo link e liberar o seu acesso.",
  },
} as const;

const AVISO_DE_SAIDA = {
  tipo: "info",
  texto: "Você saiu do sistema. Entre novamente quando quiser.",
} as const;

interface HomePageProps {
  searchParams: Promise<{
    redirectTo?: string;
    cadastro?: string;
    logout?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const session = await getServerSession();

  if (session) {
    redirect(DASHBOARD_POR_PERFIL[session.perfil]);
  }

  const { redirectTo, cadastro, logout } = await searchParams;
  const aviso =
    cadastro && cadastro in AVISOS_DE_CADASTRO
      ? AVISOS_DE_CADASTRO[cadastro as keyof typeof AVISOS_DE_CADASTRO]
      : logout === "ok"
        ? AVISO_DE_SAIDA
        : null;

  return (
    <main className="min-h-screen w-full bg-[#f5f7fb] font-poppins text-slate-950 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
      <div className="flex min-h-[28rem] items-center justify-center bg-linear-to-br from-[#252c65] via-brand-dark to-[#59639c] px-6 py-12 sm:px-12 lg:min-h-screen">
        <AuthBrandPanel
          eyebrow="Acesso acadêmico"
          title="Conhecimento que transforma realidades."
          description="Entre na plataforma do projeto de extensão e acompanhe sua jornada de aprendizagem."
        />
      </div>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-slate-200/60 shadow-xl sm:p-9">
          <div className="mb-8">
            <h2 className="mt-2 font-semibold text-2xl tracking-tight">
              Bem-vindo(a) de volta
            </h2>
            <p className="mt-2 text-slate-500 text-sm">
              Use seu e-mail ou CPF para acessar o painel.
            </p>
          </div>
          {aviso && (
            <Notificacao
              tipo={aviso.tipo}
              className="-translate-x-1/2 fixed top-4 left-1/2 z-[60] w-[min(92vw,42rem)] shadow-lg"
            >
              {aviso.texto}
            </Notificacao>
          )}

          <LoginForm
            className="flex w-full flex-col gap-y-4"
            redirectTo={redirectTo}
          />

          <p className="mt-6 border-slate-100 border-t pt-5 text-center text-slate-600 text-sm">
            Ainda não é aluno?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-brand-dark underline underline-offset-2 transition-colors hover:text-brand-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
