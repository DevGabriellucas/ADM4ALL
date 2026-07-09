import { InstrutorShell } from "@/components/instrutor/InstrutorShell";
import { MetricCard } from "@/components/instrutor/MetricCard";
import { getInstrutorDashboard } from "@/services/instrutorService";

export default async function InstrutorFrequenciaPage() {
  const dashboard = await getInstrutorDashboard();
  const { instrutor, turma, aulaReferencia, metricas } = dashboard;
  const alunos = Array.isArray(dashboard.alunos) ? dashboard.alunos : [];
  const alunosEmRisco = alunos.filter(
    (aluno) => aluno.aulasRegistradas > 0 && aluno.frequencia < 75,
  ).length;
  const alunosSemRegistros = alunos.filter(
    (aluno) => aluno.aulasRegistradas === 0,
  ).length;

  const situacaoAluno = (frequencia: number, aulasRegistradas: number) => {
    if (aulasRegistradas === 0) {
      return {
        texto: "Sem registros",
        classe: "bg-slate-100 text-slate-600",
      };
    }

    if (frequencia < 75) {
      return {
        texto: "Abaixo do minimo",
        classe: "bg-red-50 text-red-700",
      };
    }

    if (frequencia < 80) {
      return {
        texto: "Atencao",
        classe: "bg-amber-50 text-amber-700",
      };
    }

    return {
      texto: "Regular",
      classe: "bg-emerald-50 text-emerald-700",
    };
  };

  return (
    <InstrutorShell
      instrutor={instrutor}
      curso={turma?.curso ?? "Sem turma vinculada"}
      dataAula={aulaReferencia?.data ?? null}
    >
      <section aria-label="Resumo de frequencia">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon="%"
            title="Frequencia media"
            value={`${metricas.frequenciaMedia}%`}
            variant="azul"
          />
          <MetricCard
            icon="OK"
            title="Alunos em risco"
            value={alunosEmRisco}
            variant={alunosEmRisco > 0 ? "ambar" : "verde"}
          />
          <MetricCard
            icon="AL"
            title="Sem registros"
            value={alunosSemRegistros}
            variant="neutral"
          />
        </div>
      </section>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 text-sm">
          Frequencia por aluno
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-slate-200 border-b text-slate-500 text-xs">
                <th className="py-2 pr-3 font-medium">Aluno</th>
                <th className="py-2 pr-3 text-center font-medium">Presencas</th>
                <th className="py-2 pr-3 text-center font-medium">Faltas</th>
                <th className="py-2 pr-3 text-center font-medium">
                  Aulas registradas
                </th>
                <th className="py-2 pr-3 text-center font-medium">
                  Frequencia
                </th>
                <th className="py-2 pr-3 text-center font-medium">Situacao</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => {
                const situacao = situacaoAluno(
                  aluno.frequencia,
                  aluno.aulasRegistradas,
                );

                return (
                  <tr
                    key={aluno.matriculaId}
                    className="border-slate-100 border-b"
                  >
                    <td className="py-3 pr-3 font-medium text-slate-800">
                      {aluno.nome}
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600">
                      {aluno.presencas}
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600">
                      {aluno.faltas}
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600">
                      {aluno.aulasRegistradas}
                    </td>
                    <td className="py-3 pr-3 text-center font-semibold text-slate-800">
                      {aluno.frequencia}%
                    </td>
                    <td className="py-3 pr-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium text-xs ${situacao.classe}`}
                      >
                        {situacao.texto}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {alunos.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-slate-500">
                    Nenhum aluno encontrado nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </InstrutorShell>
  );
}
