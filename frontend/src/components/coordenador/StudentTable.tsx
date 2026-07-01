import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { getMatriculaStatusInfo } from "@/constants/matriculaStatus";
import type { Student } from "@/types/coordinator";

interface StudentTableProps {
  students: Student[];
}

const getStudentStatusInfo = (student: Student) => {
  if (student.statusConta === "pendente_ativacao") {
    return { label: "Pendente de ativação", tone: "amber" as const };
  }

  if (student.statusConta === "inativo") {
    return { label: "Inativo", tone: "slate" as const };
  }

  if (student.statusMatricula) {
    return getMatriculaStatusInfo(student.statusMatricula);
  }

  return { label: "Sem matrícula", tone: "slate" as const };
};

export const StudentTable = ({ students }: StudentTableProps) => {
  return (
    <section
      aria-labelledby="students-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="students-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Alunos cadastrados
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Consulte vínculos, frequência e situação de acesso.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-4xl border-separate border-spacing-0 border-slate-200 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Nome
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                E-mail
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Turma
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Frequência
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Status
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const status = getStudentStatusInfo(student);

              return (
                <tr key={student.id}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {student.nome}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {student.email}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {student.turma}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <span
                      className={
                        student.frequencia < 75 &&
                        student.statusConta !== "pendente_ativacao"
                          ? "font-semibold text-red-700"
                          : "text-slate-700"
                      }
                    >
                      {student.statusConta === "pendente_ativacao" ||
                      !student.statusMatricula
                        ? "Não iniciada"
                        : `${student.frequencia}%`}
                    </span>
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <div className="flex min-w-max flex-wrap gap-x-3 gap-y-2">
                      <button
                        type="button"
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Visualizar
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-blue-700 text-xs transition-colors hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-violet-700 text-xs transition-colors hover:text-violet-900"
                      >
                        Vincular à turma
                      </button>
                      {student.statusConta === "pendente_ativacao" && (
                        <button
                          type="button"
                          className="font-semibold text-amber-700 text-xs transition-colors hover:text-amber-900"
                        >
                          Reenviar ativação
                        </button>
                      )}
                      {student.statusConta === "ativo" && (
                        <button
                          type="button"
                          className="font-semibold text-red-600 text-xs transition-colors hover:text-red-800"
                        >
                          Desativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {students.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum aluno cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
