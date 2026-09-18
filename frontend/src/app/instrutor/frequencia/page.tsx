import { FrequenciaPanel } from "@/components/instrutor/FrequenciaPanel";
import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { getInstrutorDashboard } from "@/services/instrutorService";
import { dataDaAulaEmFoco } from "@/utils/cronograma";

export default async function InstrutorFrequenciaPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, metricas } = dashboard;

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={dataDaAulaEmFoco(dashboard)}
    >
      <FrequenciaPanel
        frequenciaMedia={metricas.frequenciaMedia}
        alunos={dashboard.alunos}
        turmaEncerrada={
          turma?.status === "encerrada" || turma?.status === "concluida"
        }
      />
    </InstrutorShell>
  );
}
