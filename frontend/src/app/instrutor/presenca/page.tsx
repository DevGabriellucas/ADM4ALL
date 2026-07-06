import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { PresencaPanel } from "@/components/instrutor/PresencaPanel";
import { getInstrutorDashboard } from "@/services/instrutorService";

export default async function InstrutorPresencaPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, aulaReferencia } = dashboard;
  const alunos = Array.isArray(dashboard.alunos) ? dashboard.alunos : [];
  const cronograma = Array.isArray(dashboard.cronograma)
    ? dashboard.cronograma
    : [];

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={aulaReferencia?.data ?? null}
    >
      {turma ? (
        <PresencaPanel
          turmaId={turma.id}
          aulaReferencia={aulaReferencia}
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
