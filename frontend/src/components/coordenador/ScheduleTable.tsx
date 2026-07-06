"use client";

import Link from "next/link";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type { Lesson, LessonScheduleStatus } from "@/types/coordinator";
import { getLessonScheduleStatus } from "@/utils/getLessonScheduleStatus";

interface ScheduleTableProps {
  lessons: Lesson[];
  isPending?: boolean;
  onEditLesson?: (lesson: Lesson) => void;
  onSetStatus?: (lesson: Lesson, status: Lesson["status"]) => void;
  onRemoveLesson?: (lesson: Lesson) => void;
}

const getStatusInfo = (status: LessonScheduleStatus) => {
  if (status === "concluida") {
    return { label: "Concluida", tone: "green" as const };
  }
  if (status === "proxima") {
    return { label: "Proxima", tone: "blue" as const };
  }
  if (status === "pendente") {
    return { label: "Pendente", tone: "amber" as const };
  }
  return { label: "Cancelada", tone: "red" as const };
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
};

export const ScheduleTable = ({
  lessons,
  isPending = false,
  onEditLesson,
  onSetStatus,
  onRemoveLesson,
}: ScheduleTableProps) => {
  return (
    <section
      aria-labelledby="schedule-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="schedule-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Planejamento das aulas
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Aulas organizadas por data e situacao atual.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-6xl border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Aula
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Tema da aula
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Curso
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Turma
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Data
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Instrutor
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Status
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Acoes
              </th>
            </tr>
          </thead>

          <tbody>
            {lessons.map((lesson) => {
              const scheduleStatus = getLessonScheduleStatus(lesson);
              const status = getStatusInfo(scheduleStatus);
              const canUpdate =
                scheduleStatus === "proxima" || scheduleStatus === "pendente";

              return (
                <tr key={lesson.id}>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#E7ECF8] font-semibold text-brand-dark text-xs">
                      {lesson.numeroAula}
                    </span>
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {lesson.titulo}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {lesson.curso}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {lesson.turma}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {formatDate(lesson.data)}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {lesson.instrutor}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <div className="flex min-w-max flex-wrap gap-x-3 gap-y-2">
                      {lesson.turmaId ? (
                        <Link
                          href={`/coordenador/turmas/${lesson.turmaId}`}
                          className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                        >
                          Visualizar
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-400 text-xs">
                          Visualizar
                        </span>
                      )}

                      {canUpdate && (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditLesson?.(lesson)}
                            disabled={isPending}
                            className="font-semibold text-blue-700 text-xs transition-colors hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Editar data
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetStatus?.(lesson, "realizada")}
                            disabled={isPending}
                            className="font-semibold text-emerald-700 text-xs transition-colors hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Marcar como concluida
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetStatus?.(lesson, "cancelada")}
                            disabled={isPending}
                            className="font-semibold text-red-600 text-xs transition-colors hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancelar aula
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveLesson?.(lesson)}
                        disabled={isPending}
                        className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {lessons.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhuma aula encontrada para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
