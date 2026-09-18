import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { MetricCard } from "@/components/instrutor/MetricCard";
import { getInstrutorDashboard } from "@/services/instrutorService";
import {
  AULAS_POR_PERIODO,
  blocosConcluidos,
  dataDaAulaEmFoco,
  turnoDoCronograma,
} from "@/utils/cronograma";
import { formatData } from "@/utils/format";
import { dataDeHoje } from "@/utils/fusoInstituicao";

export default async function InstrutorDashboardPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, metricas } = dashboard;
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
  // A proxima aula do cronograma que ainda nao foi dada.
  //
  // Lia `aulaAtual`, que so olha o horario de termino e nao o status: a aula
  // marcada como realizada hoje de manha aparecia como "proxima" ate o fim do
  // dia, e a turma que ja cumpriu tudo anunciava a ultima aula como se ela
  // ainda fosse acontecer. `aulaAtual` continua valendo para a chamada, que
  // precisa abrir na aula de hoje mesmo depois de realizada.
  const proximaAulaAgenda =
    cronograma.find(
      (aula) => aula.status === "planejada" && aula.data >= hoje,
    ) ?? null;
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
    ? `Aula ${proximaAulaAgenda.numero} - ${proximaAulaAgenda.titulo}`
    : "Sem aula agendada";

  // A cada 10 aulas realizadas a turma fecha um periodo letivo. O aviso diz de
  // qual periodo sao as aulas cumpridas e qual vem depois; quem troca o valor
  // oficial da turma continua sendo a coordenacao, em Configuracoes.
  // Sem horario no cronograma nao da para afirmar o turno: o card diz isso em
  // vez de repetir o valor de cadastro, que costuma ser so o padrao.
  const turnoDaTurma =
    turnoDoCronograma(cronograma) ?? "turno a definir no cronograma";

  const blocos = blocosConcluidos(cronograma);
  const periodoCumprido = blocos > 0;

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={dataDaAulaEmFoco(dashboard)}
    >
      {/* So o que a turma cumpriu, no periodo dela. O aviso ja anunciou o
          periodo seguinte ("Período letivo 2027.1") e, lido de relance,
          parecia dizer que a turma tinha mudado de periodo — quem troca esse
          valor e a coordenacao, em Configuracoes. */}
      {periodoCumprido && turma && (
        <output className="block rounded-lg border border-brand-light bg-[#F1F4FC] px-5 py-4 text-center font-medium text-brand-dark text-sm">
          A turma cumpriu {blocos * AULAS_POR_PERIODO} aulas do período{" "}
          {turma.periodoLetivo}.
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
            subtitle={proximaAulaTexto}
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
                {aulaHoje.horaInicio
                  ? ` • ${aulaHoje.horaInicio}${aulaHoje.horaFim ? ` às ${aulaHoje.horaFim}` : ""}`
                  : ""}
              </p>
              <p className="mt-1 text-slate-500 text-xs">
                {aulaHoje.status === "realizada"
                  ? "Aula já marcada como realizada."
                  : "Lance a chamada em Presença quando a aula terminar."}
              </p>
            </div>
          ) : (
            /* Sem aula hoje o cartao ficava so com a negativa. Dizer qual e a
               proxima responde a pergunta seguinte sem trocar de tela. */
            <div className="mt-2 text-slate-600 text-sm">
              <p>Nenhuma aula marcada para hoje.</p>
              <p className="mt-1 text-slate-500 text-xs">
                {proximaAulaAgenda
                  ? `Próxima: ${formatData(proximaAulaAgenda.data)} - Aula ${proximaAulaAgenda.numero}.`
                  : "Não há aula planejada no cronograma da turma."}
              </p>
            </div>
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
        {/* Nome e turno, so. O turno sai do horario das aulas do cronograma, e
            nao da coluna `turno` da turma: aquela e escolhida uma vez no
            cadastro e continua com o padrao mesmo quando as aulas foram
            marcadas para outro periodo do dia. */}
        <p className="mt-2 text-slate-600 text-sm">
          {turma
            ? `${turma.nome} - ${turnoDaTurma}`
            : "Nenhuma turma vinculada a este instrutor."}
        </p>
      </section>
    </InstrutorShell>
  );
}
