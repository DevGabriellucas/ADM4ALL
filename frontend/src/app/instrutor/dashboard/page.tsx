import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { MetricCard } from "@/components/instrutor/MetricCard";
import { getInstrutorDashboard } from "@/services/instrutorService";
import {
  AULAS_POR_PERIODO,
  avancarPeriodoLetivo,
  blocosConcluidos,
} from "@/utils/cronograma";
import { formatData } from "@/utils/format";
import { dataDeHoje } from "@/utils/fusoInstituicao";

export default async function InstrutorDashboardPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, proximaAula, metricas } = dashboard;
  const cronograma = Array.isArray(dashboard.cronograma)
    ? dashboard.cronograma
    : [];
  const materiais = Array.isArray(dashboard.materiais)
    ? dashboard.materiais
    : [];
  const alunos = Array.isArray(dashboard.alunos) ? dashboard.alunos : [];
  // Data no fuso da instituicao: toISOString() devolve UTC, entao depois das
  // 21h em Joao Pessoa o servidor ja estava no dia seguinte e a aula de hoje
  // sumia do painel, junto com a contagem de aulas planejadas atrasadas.
  const hoje = dataDeHoje();
  const aulaHoje =
    cronograma.find(
      (aula) => aula.data === hoje && aula.status !== "cancelada",
    ) ?? null;
  // O backend ja entrega a agenda em ordem: aulaAtual e a aula que esta por vir
  // e proximaAula e a SEGUINTE a ela. O card "Proxima aula" quer a que esta por
  // vir; lendo proximaAula, ele anunciava "Sem aula agendada" sempre que
  // faltava exatamente uma aula na turma.
  const proximaAulaAgenda = dashboard.aulaAtual ?? proximaAula;
  const alunosSemPresenca = alunos.filter(
    (aluno) => aluno.statusPresenca === null,
  ).length;
  const aulasPlanejadasAtrasadas = cronograma.filter(
    (aula) => aula.status === "planejada" && aula.data < hoje,
  ).length;
  const materiaisRecentes = [...materiais]
    .sort((a, b) => b.dataPublicacao.localeCompare(a.dataPublicacao))
    .slice(0, 3);
  const alertasRapidos = [
    alunosSemPresenca > 0
      ? `${alunosSemPresenca} alunos sem presença registrada na aula de referência.`
      : "Presença da aula de referência sem pendências.",
    aulasPlanejadasAtrasadas > 0
      ? `${aulasPlanejadasAtrasadas} aulas planejadas antigas precisam de status.`
      : "Cronograma sem aulas planejadas atrasadas.",
    materiais.length === 0
      ? "Nenhum material cadastrado para a turma."
      : `${materiais.length} materiais disponiveis para gestao da turma.`,
  ];

  const proximaAulaTexto = proximaAulaAgenda
    ? `${formatData(proximaAulaAgenda.data)} - Aula ${proximaAulaAgenda.numero}`
    : "Sem aula agendada";

  // A cada 10 aulas realizadas a turma fecha um periodo letivo. O aviso mostra
  // qual periodo comeca agora; quem troca o valor oficial da turma continua
  // sendo a coordenacao, em Configuracoes.
  const blocos = blocosConcluidos(cronograma);
  const periodoSeguinte = turma
    ? avancarPeriodoLetivo(turma.periodoLetivo, blocos)
    : null;

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={dashboard.aulaAtual?.data ?? null}
    >
      {periodoSeguinte && (
        <output className="block rounded-lg border border-brand-light bg-[#F1F4FC] px-5 py-4 text-center font-medium text-brand-dark text-sm">
          A turma concluiu {blocos * AULAS_POR_PERIODO} aulas. Período letivo{" "}
          {periodoSeguinte}.
        </output>
      )}

      <section id="dashboard" aria-label="Resumo do instrutor">
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
            value={proximaAulaAgenda ? formatData(proximaAulaAgenda.data) : "-"}
            subtitle={
              proximaAulaAgenda ? proximaAulaTexto : "Sem aula agendada"
            }
            variant="ambar"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 text-sm">Aula de hoje</h2>
          {aulaHoje ? (
            <div className="mt-3">
              <p className="font-medium text-slate-900 text-sm">
                Aula {aulaHoje.numero} - {aulaHoje.titulo}
              </p>
              <p className="mt-1 text-slate-500 text-xs">
                {formatData(aulaHoje.data)}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-slate-600 text-sm">
              Nenhuma aula marcada para hoje.
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 text-sm">
            Alertas rápidos
          </h2>
          <ul className="mt-3 space-y-2 text-slate-600 text-sm">
            {alertasRapidos.map((alerta) => (
              <li key={alerta} className="flex gap-x-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-medium" />
                <span>{alerta}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 text-sm">
            Materiais recentes
          </h2>
          {materiaisRecentes.length === 0 ? (
            <p className="mt-2 text-slate-600 text-sm">
              Nenhum material publicado ainda.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {materiaisRecentes.map((material) => (
                <li key={material.id}>
                  <p className="font-medium text-slate-800 text-sm">
                    {material.titulo}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {material.aulaTitulo ?? "Material geral"} -{" "}
                    {formatData(material.dataPublicacao)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 text-sm">Turma atual</h2>
        <p className="mt-2 text-slate-600 text-sm">
          {turma
            ? `${turma.nome} - ${turma.turno} - ${cronograma.length} aulas cadastradas`
            : "Nenhuma turma vinculada a este instrutor."}
        </p>
      </section>
    </InstrutorShell>
  );
}
