import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { MateriaisPanel } from "@/components/instrutor/MateriaisPanel";
import { getInstrutorDashboard } from "@/services/instrutorService";
import { dataDaAulaEmFoco } from "@/utils/cronograma";

export default async function InstrutorMateriaisPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma } = dashboard;
  const materiais = Array.isArray(dashboard.materiais)
    ? dashboard.materiais
    : [];
  const cronograma = Array.isArray(dashboard.cronograma)
    ? dashboard.cronograma
    : [];

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={dataDaAulaEmFoco(dashboard)}
    >
      {turma ? (
        <MateriaisPanel
          turmaId={turma.id}
          publicadoPorId={instrutor.usuarioId}
          materiais={materiais}
          aulas={cronograma}
        />
      ) : (
        <section className="rounded-lg bg-white p-5 text-slate-500 text-sm shadow-sm">
          Nenhuma turma vinculada a este instrutor.
        </section>
      )}
    </InstrutorShell>
  );
}
