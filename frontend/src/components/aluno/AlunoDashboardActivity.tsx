import type {
  AlunoDashboard,
  AulaCalendario,
  HistoricoPresenca,
} from "@/types/aluno";

interface AlunoDashboardActivityProps {
  aluno: Pick<AlunoDashboard, "historicoPresencas" | "calendarioTurma">;
}

const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
};

const situacaoPresenca: Record<HistoricoPresenca["situacao"], string> = {
  presente: "Presente",
  falta: "Falta",
  justificada: "Justificada",
  pendente: "Pendente",
};

const situacaoClasses: Record<HistoricoPresenca["situacao"], string> = {
  presente: "bg-emerald-50 text-emerald-700",
  falta: "bg-red-50 text-red-700",
  justificada: "bg-amber-50 text-amber-800",
  pendente: "bg-slate-100 text-slate-600",
};

// Aula cancelada e vermelha, no mesmo peso com que "Realizada" e verde. Em
// cinza ela lia como "ainda nao aconteceu" e o aluno continuava esperando uma
// aula que nao vai ter.
const calendarioClasses: Record<AulaCalendario["status"], string> = {
  planejada: "bg-blue-50 text-blue-700",
  realizada: "bg-emerald-50 text-emerald-700",
  cancelada: "bg-red-50 text-red-700",
};

const calendarioLabel: Record<AulaCalendario["status"], string> = {
  planejada: "Planejada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

// O cartao "Comunicados importantes" saiu da tela em 18/09: o que ele anunciava
// (curso concluido, reprovacao por falta, certificado liberado) ja esta dito
// nos cartoes de status, de frequencia e de certificado, e repetido ali virava
// um bloco que quase sempre dizia "nao ha comunicados no momento".

export const AlunoDashboardActivity = ({
  aluno,
}: AlunoDashboardActivityProps) => (
  <section
    aria-label="Informações acadêmicas detalhadas"
    className="grid grid-cols-1 gap-4 lg:grid-cols-2"
  >
    <article className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-lg text-slate-950">
        Últimas presenças
      </h2>
      {aluno.historicoPresencas.length > 0 ? (
        <div className="mt-4 divide-y divide-slate-100">
          {aluno.historicoPresencas.map((registro) => (
            <div
              key={`${registro.aula}-${registro.data}`}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800 text-sm">
                  {registro.aula}
                </p>
                <p className="mt-1 text-slate-500 text-xs">
                  {formatarData(registro.data)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-medium text-xs ${situacaoClasses[registro.situacao]}`}
              >
                {situacaoPresenca[registro.situacao]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-slate-600 text-sm">
          Ainda não há chamadas registradas.
        </p>
      )}
    </article>

    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-lg text-slate-950">
        Calendário da turma
      </h2>
      {aluno.calendarioTurma.length > 0 ? (
        <div className="mt-4 space-y-2 pr-1">
          {aluno.calendarioTurma.map((aula) => (
            <div
              key={`${aula.aula}-${aula.data}`}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800 text-sm">
                  {aula.aula}
                </p>
                <p className="mt-1 text-slate-500 text-xs">
                  {formatarData(aula.data)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 font-medium text-xs ${calendarioClasses[aula.status]}`}
              >
                {calendarioLabel[aula.status]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-slate-600 text-sm">
          Ainda não há aulas cadastradas para a turma.
        </p>
      )}
    </article>
  </section>
);
