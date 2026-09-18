import { CronogramaList } from "@/components/instrutor/CronogramaList";
import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { getInstrutorDashboard } from "@/services/instrutorService";
import { dataDaAulaEmFoco } from "@/utils/cronograma";

export default async function InstrutorCronogramaPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma } = dashboard;
  const cronograma = Array.isArray(dashboard.cronograma)
    ? dashboard.cronograma
    : [];

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={dataDaAulaEmFoco(dashboard)}
    >
      <CronogramaList turmaId={turma?.id ?? null} aulas={cronograma} />
    </InstrutorShell>
  );
}
