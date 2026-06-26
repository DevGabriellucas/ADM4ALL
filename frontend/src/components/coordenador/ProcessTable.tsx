import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type { ProcessRecord } from "@/types/coordinator";

interface ProcessTableProps {
  processes: ProcessRecord[];
}

const getProcessStatusInfo = (status: ProcessRecord["status"]) => {
  if (status === "em_analise") {
    return { label: "Em andamento", tone: "blue" as const };
  }
  if (status === "concluido") {
    return { label: "Concluído", tone: "green" as const };
  }
  if (status === "cancelado") {
    return { label: "Cancelado", tone: "red" as const };
  }
  return { label: "Pendente", tone: "amber" as const };
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(date),
  );
};

export const ProcessTable = ({ processes }: ProcessTableProps) => {
  return (
    <section
      aria-labelledby="processes-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="processes-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Processos cadastrados
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Acompanhe responsáveis, datas e situação atual.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-3xl border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Nome do processo
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Status
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Responsável
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Data de criação
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {processes.map((process) => {
              const status = getProcessStatusInfo(process.status);

              return (
                <tr key={process.id}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {process.nome}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {process.responsavel}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {formatDate(process.dataCriacao)}
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
                        className="font-semibold text-red-600 text-xs transition-colors hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {processes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum processo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
