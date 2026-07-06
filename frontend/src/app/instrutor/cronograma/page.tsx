import { CronogramaList } from "@/components/instrutor/CronogramaList";
import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { getInstrutorDashboard } from "@/services/instrutorService";

export default async function InstrutorCronogramaPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, aulaReferencia } = dashboard;
  const cronograma = Array.isArray(dashboard.cronograma)
    ? dashboard.cronograma
    : [];

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={aulaReferencia?.data ?? null}
    >
      <CronogramaList turmaId={turma?.id ?? null} aulas={cronograma} />
    </InstrutorShell>
  );
}
