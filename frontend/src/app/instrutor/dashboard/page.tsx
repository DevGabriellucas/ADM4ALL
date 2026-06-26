import { CronogramaList } from "@/components/instrutor/CronogramaList";
import { InstrutorSidebar } from "@/components/instrutor/InstrutorSidebar";
import { InstrutorTopbar } from "@/components/instrutor/InstrutorTopbar";
import { MateriaisPanel } from "@/components/instrutor/MateriaisPanel";
import { MetricCard } from "@/components/instrutor/MetricCard";
import { PresencaPanel } from "@/components/instrutor/PresencaPanel";
import { getInstrutorDashboard } from "@/services/instrutorService";
import { formatData } from "@/utils/format";

export default async function InstrutorDashboardPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, aulaReferencia, proximaAula, metricas } = dashboard;

  const proximaAulaTexto = proximaAula
    ? `${formatData(proximaAula.data)} - Aula ${proximaAula.numero}`
    : "Sem aula agendada";

  return (
    <div className="flex min-h-screen flex-col bg-[#EDF1FB] font-poppins text-slate-950 lg:flex-row">
      <InstrutorSidebar instrutor={instrutor} />

      <main id="dashboard" className="flex-1 px-4 py-6 sm:px-6 xl:px-10">
        <div className="flex w-full max-w-none flex-col gap-y-6">
          <InstrutorTopbar
            curso={turma?.curso ?? "Sem turma vinculada"}
            dataAula={aulaReferencia?.data ?? null}
          />

          <section id="metricas" aria-label="Indicadores da turma">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon="AL"
                title="Total de alunos matriculados"
                value={metricas.totalAlunos}
                variant="neutral"
              />
              <MetricCard
                icon="OK"
                title="Presentes hoje"
                value={metricas.presentesHoje}
                subtitle={`de ${metricas.totalAlunos} alunos`}
                variant="verde"
              />
              <MetricCard
                icon="%"
                title="Frequência média da turma"
                value={`${metricas.frequenciaMedia}%`}
                variant="azul"
              />
              <MetricCard
                icon="Aula"
                title="Próxima aula"
                value={proximaAula ? formatData(proximaAula.data) : "-"}
                subtitle={proximaAula ? proximaAulaTexto : "Sem aula agendada"}
                variant="ambar"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(22rem,0.8fr)]">
            <div className="flex min-w-0 flex-col gap-y-6">
              {turma ? (
                <PresencaPanel
                  turmaId={turma.id}
                  aulaReferencia={aulaReferencia}
                  alunos={dashboard.alunos}
                />
              ) : (
                <section className="rounded-lg bg-white p-5 text-slate-500 text-sm shadow-sm">
                  Nenhuma turma vinculada a este instrutor.
                </section>
              )}

              {turma && (
                <MateriaisPanel
                  turmaId={turma.id}
                  publicadoPorId={instrutor.usuarioId}
                  materiais={dashboard.materiais}
                />
              )}
            </div>

            <div className="min-w-0">
              <CronogramaList aulas={dashboard.cronograma} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
