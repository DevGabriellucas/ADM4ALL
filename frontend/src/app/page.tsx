import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
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
    <AuthShell
      eyebrow="Projeto de extensão · UNIPÊ"
      tituloPainel="Administração para Todos: formação gratuita em rotinas administrativas."
      descricaoPainel="Um projeto de extensão do UNIPÊ, aberto a quem estuda na instituição e a quem é da comunidade. As aulas são presenciais e é por aqui que você acompanha o cronograma, a sua frequência, os materiais e o seu certificado."
      destaques={[
        "Gratuito e sem pré-requisito: basta se inscrever.",
        "Aulas presenciais, com instrutores do projeto.",
        "Certificado de extensão para quem cumpre a frequência.",
        "Cronograma, presença e materiais no seu painel.",
      ]}
      tituloCartao="Entrar na plataforma"
      descricaoCartao="Use o e-mail ou o CPF que você cadastrou."
    >
      {aviso && (
        <Notificacao posicao="inline" tipo={aviso.tipo} className="mb-5">
          {aviso.texto}
        </Notificacao>
      )}

      <LoginForm
        className="flex w-full flex-col gap-y-4"
        redirectTo={redirectTo}
      />

      <p className="mt-6 border-line border-t pt-5 text-[0.875rem] text-slate-600">
        Ainda não tem cadastro?{" "}
        <Link
          href="/cadastro"
          className="rounded font-semibold text-azure-700 underline underline-offset-2 transition-colors hover:text-azure-600 focus-visible:outline-2 focus-visible:outline-azure-600 focus-visible:outline-offset-2"
        >
          Criar minha conta
        </Link>
      </p>
    </AuthShell>
  );
}
