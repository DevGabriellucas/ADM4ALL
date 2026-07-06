import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import {
  getMatriculaStatusInfo,
  MATRICULA_STATUS,
} from "@/constants/matriculaStatus";
import type {
  AttendanceSituation,
  AttendanceSummary,
} from "@/types/coordinator";
import { getAttendanceSituation } from "@/utils/getAttendanceSituation";

interface AttendanceTableProps {
  attendance: AttendanceSummary[];
}

const getSituationInfo = (situation: AttendanceSituation) => {
  if (situation === "regular") {
    return { label: "Regular", tone: "green" as const };
  }
  if (situation === "atencao") {
    return { label: "Atenção", tone: "amber" as const };
  }
  if (situation === "risco_reprovacao") {
    return { label: "Risco de reprovação", tone: "orange" as const };
  }
  return getMatriculaStatusInfo(MATRICULA_STATUS.REPROVADO_FALTA);
};

export const AttendanceTable = ({ attendance }: AttendanceTableProps) => {
  return (
    <section
      aria-labelledby="attendance-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="attendance-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Frequência dos alunos
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Resultado consolidado conforme os filtros selecionados.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-4xl border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Aluno
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Turma
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Presenças
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Faltas
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Frequência
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Situação
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((record) => {
              const situation = getSituationInfo(
                getAttendanceSituation(record),
              );

              return (
                <tr key={`${record.aluno}-${record.turma}`}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {record.aluno}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {record.turma}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {record.presencas}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {record.faltas}
                  </td>
                  <td
                    className={`border-slate-100 border-b px-3 py-3 font-semibold ${
                      record.frequencia < 75 ? "text-red-700" : "text-slate-800"
                    }`}
                  >
                    {record.frequencia}%
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={situation.label}
                      tone={situation.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Funcionalidade ainda não disponível no MVP"
                      className="cursor-not-allowed font-semibold text-slate-400 text-xs"
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              );
            })}

            {attendance.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
