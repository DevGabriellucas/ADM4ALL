import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { getInstrutorDashboard } from "@/services/instrutorService";

export default async function InstrutorPerfilPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, aulaReferencia } = dashboard;

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={aulaReferencia?.data ?? null}
    >
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h1 className="font-semibold text-slate-950 text-lg">Perfil</h1>
        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500 text-xs">Nome</dt>
            <dd className="mt-1 text-slate-900 text-sm">{instrutor.nome}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500 text-xs">
              Area de atuacao
            </dt>
            <dd className="mt-1 text-slate-900 text-sm">
              {instrutor.areaAtuacao ?? "Nao informada"}
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-slate-500 text-sm">
          O avatar usa automaticamente a primeira letra do nome e a primeira
          letra do sobrenome.
        </p>
      </section>
    </InstrutorShell>
  );
}
