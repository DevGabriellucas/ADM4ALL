import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type { Instructor } from "@/types/coordinator";

interface InstructorTableProps {
  instructors: Instructor[];
}

const getInstructorStatusInfo = (status: Instructor["status"]) => {
  if (status === "ativo") {
    return { label: "Ativo", tone: "green" as const };
  }

  if (status === "pendente_ativacao") {
    return { label: "Pendente de ativação", tone: "amber" as const };
  }

  if (status === "bloqueado") {
    return { label: "Bloqueado", tone: "red" as const };
  }

  return { label: "Inativo", tone: "slate" as const };
};

export const InstructorTable = ({ instructors }: InstructorTableProps) => {
  return (
    <section
      aria-labelledby="instructors-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="instructors-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Instrutores cadastrados
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Acompanhe vínculos, acessos ativos e convites enviados.
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
                Telefone
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Status
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Turmas vinculadas
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {instructors.map((instructor) => {
              const status = getInstructorStatusInfo(instructor.status);

              return (
                <tr key={instructor.id}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {instructor.nome}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {instructor.email}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {instructor.telefone ?? "Não informado"}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {instructor.turmasVinculadas}
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
                      {instructor.status === "pendente_ativacao" && (
                        <button
                          type="button"
                          className="font-semibold text-amber-700 text-xs transition-colors hover:text-amber-900"
                        >
                          Reenviar ativação
                        </button>
                      )}
                      {instructor.status === "ativo" && (
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

            {instructors.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum instrutor cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
