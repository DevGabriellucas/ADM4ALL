import { MetricCard } from "@/components/instrutor/MetricCard";
import {
  FALTAS_TOLERADAS,
  MATRICULA_STATUS,
} from "@/constants/matriculaStatus";
import type { AlunoPresenca } from "@/types/instrutor";

interface FrequenciaPanelProps {
  /** Media da turma, calculada no backend. */
  frequenciaMedia: number;
  alunos: AlunoPresenca[];
  /** Turma encerrada zera o card de risco: o desfecho nao muda mais. */
  turmaEncerrada: boolean;
}

// O desfecho da matricula manda na coluna: com a turma encerrada, "Reprovado
// por falta" e a informacao util, nao a margem de faltas. A margem fica para
// quem ainda esta em andamento.
const situacaoAluno = (aluno: AlunoPresenca) => {
  const { aulasRegistradas, statusMatricula } = aluno;

  if (statusMatricula === MATRICULA_STATUS.REPROVADO_FALTA) {
    return {
      texto: "Reprovado por falta",
      classe: "bg-red-100 text-red-800",
    };
  }

  if (statusMatricula === MATRICULA_STATUS.APROVADO) {
    return {
      texto: "Aprovado",
      classe: "bg-emerald-100 text-emerald-800",
    };
  }

  if (aulasRegistradas === 0) {
    return {
      texto: "Sem chamada registrada",
      classe: "bg-slate-100 text-slate-600",
    };
  }

  // Classifica por falta, nao por faixa de frequencia. A frequencia se acumula
  // ao longo do periodo, entao no meio do curso ate quem nunca faltou esta
  // abaixo de 80% — as faixas antigas diziam "Risco" para a turma inteira na
  // primeira semana. Falta ja e definitiva no dia em que acontece.
  if (aluno.faltas > FALTAS_TOLERADAS) {
    return {
      texto: "Risco: não alcança mais 80%",
      classe: "bg-red-50 text-red-700",
    };
  }

  if (aluno.faltas === FALTAS_TOLERADAS) {
    return {
      texto: "Atenção: sem margem para faltar",
      classe: "bg-amber-50 text-amber-700",
    };
  }

  return {
    texto: "Regular: sem faltas",
    classe: "bg-emerald-50 text-emerald-700",
  };
};

/**
 * Consolidado de frequencia de uma turma. Instrutor e coordenacao veem a mesma
 * tela: os numeros vem prontos do backend, e refazer a conta aqui ja fez a API
 * dizer 90% enquanto a tela mostrava 40%.
 */
export const FrequenciaPanel = ({
  frequenciaMedia,
  alunos,
  turmaEncerrada,
}: FrequenciaPanelProps) => {
  const alunosSeguro = Array.isArray(alunos) ? alunos : [];
  // "Em risco" e quem ainda da tempo de salvar. Com a turma encerrada o
  // desfecho e final, entao o card zera em vez de apontar uma reprovacao que
  // nao tem mais como reverter.
  const alunosEmRisco = turmaEncerrada
    ? 0
    : alunosSeguro.filter((aluno) => aluno.faltas > FALTAS_TOLERADAS).length;
  const alunosSemRegistros = alunosSeguro.filter(
    (aluno) => aluno.aulasRegistradas === 0,
  ).length;

  return (
    <>
      <section aria-label="Resumo de frequência">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon="%"
            title="Frequência média"
            value={`${frequenciaMedia}%`}
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
          Frequência por aluno
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-slate-200 border-b text-slate-500 text-xs">
                <th className="py-2 pr-3 font-medium">Aluno</th>
                <th className="py-2 pr-3 text-center font-medium">Presenças</th>
                <th className="py-2 pr-3 text-center font-medium">
                  Justificadas
                </th>
                <th className="py-2 pr-3 text-center font-medium">Faltas</th>
                <th className="py-2 pr-3 text-center font-medium">
                  Aulas registradas
                </th>
                <th className="py-2 pr-3 text-center font-medium">
                  Frequência
                </th>
                <th className="py-2 pr-3 text-center font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {alunosSeguro.map((aluno) => {
                const situacao = situacaoAluno(aluno);

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
                      {aluno.justificadas}
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
              {alunosSeguro.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-slate-500">
                    Nenhum aluno encontrado nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};
