import Link from "next/link";
import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { getInstrutorDashboard } from "@/services/instrutorService";

export default async function InstrutorConfiguracoesPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, aulaReferencia } = dashboard;

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={aulaReferencia?.data ?? null}
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="max-w-2xl">
          <h1 className="font-semibold text-lg text-slate-950">
            Configuracoes do instrutor
          </h1>
          <p className="mt-3 text-slate-600 text-sm leading-6">
            Nesta versao, as preferencias editaveis do instrutor ficam
            concentradas no perfil. Os ajustes gerais do sistema continuam sob
            responsabilidade da coordenacao.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/instrutor/perfil"
            className="rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-medium hover:bg-slate-50"
          >
            <span className="font-semibold text-slate-900 text-sm">
              Perfil e foto
            </span>
            <span className="mt-2 block text-slate-500 text-xs leading-5">
              Atualize a foto exibida na area do instrutor.
            </span>
          </Link>

          <div className="rounded-lg border border-slate-200 border-dashed p-4">
            <span className="font-semibold text-slate-700 text-sm">
              Preferencias
            </span>
            <span className="mt-2 block text-slate-500 text-xs leading-5">
              Sem configuracoes pessoais adicionais no MVP.
            </span>
          </div>
        </div>
      </section>
    </InstrutorShell>
  );
}
