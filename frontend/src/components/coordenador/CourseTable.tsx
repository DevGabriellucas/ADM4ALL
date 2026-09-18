"use client";

import Link from "next/link";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type { Course } from "@/types/coordinator";

interface CourseTableProps {
  courses: Course[];
  onDelete: (course: Course) => void;
}

const getCourseStatusInfo = (status: Course["status"]) => {
  if (status === "ativo") {
    return { label: "Ativo", tone: "green" as const };
  }

  if (status === "em_planejamento") {
    return { label: "Em planejamento", tone: "blue" as const };
  }

  return { label: "Desativado", tone: "slate" as const };
};

// Sem botao de editar: "Visualizar" abre a pagina do curso, e a edicao vive
// la. Ter os dois lado a lado era o mesmo destino em dois botoes.
export const CourseTable = ({ courses, onDelete }: CourseTableProps) => {
  return (
    <section
      aria-labelledby="courses-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="courses-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Cursos cadastrados
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Consulte a carga horária, as turmas e a situação de cada curso.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-3xl border-separate border-spacing-0 border-slate-200 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Nome do curso
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Carga horária
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Turmas
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
            {courses.map((course) => {
              const status = getCourseStatusInfo(course.status);

              return (
                <tr key={course.id}>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <p className="font-medium text-slate-900">{course.nome}</p>
                    <p className="mt-1 max-w-md text-slate-500 text-xs">
                      {course.descricao}
                    </p>
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {course.cargaHoraria}h
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {course.quantidadeTurmas}
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
                        href={`/coordenador/cursos/${course.id}`}
                        className="cursor-pointer font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
                      >
                        Visualizar
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(course)}
                        className="cursor-pointer font-semibold text-red-600 text-xs transition-colors hover:text-red-800 focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {courses.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum curso cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
