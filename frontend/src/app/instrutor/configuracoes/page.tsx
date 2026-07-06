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
        <h1 className="font-semibold text-slate-950 text-lg">Configuracoes</h1>
        <p className="mt-3 text-slate-600 text-sm">
          Nenhuma configuracao editavel disponivel para o instrutor no MVP.
        </p>
      </section>
    </InstrutorShell>
  );
}
