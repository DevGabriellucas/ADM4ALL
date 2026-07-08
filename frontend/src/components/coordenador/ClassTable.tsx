"use client";

import Link from "next/link";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type { ClassGroup } from "@/types/coordinator";

interface ClassTableProps {
  classes: ClassGroup[];
  onEdit: (classGroup: ClassGroup) => void;
  onClose: (classGroup: ClassGroup) => void;
  onManageStudents: (classGroup: ClassGroup) => void;
}

const classStatusInfo: Record<
  ClassGroup["status"],
  {
    label: string;
    tone: "green" | "amber" | "red" | "blue";
  }
> = {
  planejada: { label: "Planejada", tone: "amber" },
  em_andamento: { label: "Em andamento", tone: "blue" },
  concluida: { label: "Concluída", tone: "green" },
  encerrada: { label: "Encerrada", tone: "red" },
  cancelada: { label: "Cancelada", tone: "red" },
};

export const ClassTable = ({
  classes,
  onEdit,
  onClose,
  onManageStudents,
}: ClassTableProps) => {
  return (
    <section
      aria-labelledby="classes-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="classes-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Turmas cadastradas
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Consulte vínculos, períodos e situação das turmas.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-5xl border-separate border-spacing-0 border-slate-200 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Nome da turma
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Curso
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Instrutores
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Alunos
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Período letivo
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
            {classes.map((classGroup) => {
              const status = classStatusInfo[classGroup.status];

              return (
                <tr key={classGroup.id}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {classGroup.nome}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {classGroup.curso}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {classGroup.instrutores || "-"}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {classGroup.alunos}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {classGroup.periodoLetivo || "-"}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <div className="flex min-w-max flex-wrap gap-x-3 gap-y-2">
                      <Link
                        href={`/coordenador/turmas/${classGroup.id}`}
                        className="cursor-pointer font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Visualizar
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(classGroup)}
                        className="cursor-pointer font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Editar
                      </button>
                      {classGroup.status !== "cancelada" &&
                        classGroup.status !== "encerrada" &&
                        classGroup.status !== "concluida" && (
                          <button
                            type="button"
                            onClick={() => onManageStudents(classGroup)}
                            className="cursor-pointer font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                          >
                            Gerenciar alunos
                          </button>
                        )}
                      {classGroup.status === "em_andamento" && (
                        <button
                          type="button"
                          onClick={() => onClose(classGroup)}
                          className="cursor-pointer font-semibold text-red-600 text-xs transition-colors hover:text-red-800"
                        >
                          Encerrar turma
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {classes.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhuma turma cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
