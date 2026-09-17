import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { PresencaPanel } from "@/components/instrutor/PresencaPanel";
import {
  getInstrutorDashboard,
  resolverChamadaAberta,
} from "@/services/instrutorService";

export default async function InstrutorPresencaPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma } = dashboard;
  const cronograma = Array.isArray(dashboard.cronograma)
    ? dashboard.cronograma
    : [];
  const { aulaSelecionada, alunos } = await resolverChamadaAberta(dashboard);

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={dashboard.aulaAtual?.data ?? null}
    >
      {turma ? (
        <PresencaPanel
          turmaId={turma.id}
          aulaReferencia={aulaSelecionada}
          cronograma={cronograma}
          alunos={alunos}
        />
      ) : (
        <section className="rounded-lg bg-white p-5 text-slate-500 text-sm shadow-sm">
          Nenhuma turma vinculada a este instrutor.
        </section>
      )}
    </InstrutorShell>
  );
}
