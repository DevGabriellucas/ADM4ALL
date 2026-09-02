import Link from "next/link";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import {
  getMatriculaStatusInfo,
  MATRICULA_STATUS,
} from "@/constants/matriculaStatus";
import type { AttendanceSummary } from "@/types/coordinator";

interface AttentionStudentsTableProps {
  students: AttendanceSummary[];
}

const getSituationInfo = (situacao: AttendanceSummary["situacao"]) => {
  if (situacao === MATRICULA_STATUS.REPROVADO_FALTA) {
    return getMatriculaStatusInfo(MATRICULA_STATUS.REPROVADO_FALTA);
  }

  if (situacao === "atencao") {
    return { label: "Em atenção", tone: "amber" as const };
  }

  if (situacao === "risco_reprovacao") {
    return { label: "Risco de reprovação", tone: "orange" as const };
  }

  if (situacao === "sem_registro") {
    return { label: "Sem chamada registrada", tone: "slate" as const };
  }

  return { label: "Regular", tone: "green" as const };
};

export const AttentionStudentsTable = ({
  students,
}: AttentionStudentsTableProps) => {
  return (
    <section
      aria-labelledby="attention-students-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex flex-col gap-y-1">
        <h2
          id="attention-students-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Alunos em atenção
        </h2>
        <p className="text-slate-500 text-xs">
          Acompanhamento de frequência e situação por turma.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-2xl border-separate border-spacing-0 border-slate-200 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Aluno
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Turma
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Frequência
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Situação
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Ação
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const situation = getSituationInfo(student.situacao);

              return (
                <tr key={`${student.aluno}-${student.turma}`}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {student.aluno}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-600">
                    {student.turma}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {student.frequencia}%
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={situation.label}
                      tone={situation.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <Link
                      href="/coordenador/alunos"
                      className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                    >
                      Ver aluno
                    </Link>
                  </td>
                </tr>
              );
            })}

            {students.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum aluno em atenção no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
