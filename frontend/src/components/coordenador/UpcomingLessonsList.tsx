// Componente preservado para futura integracao com endpoint real de
// aulas do coordenador (Gabriel). Nao importa mock — recebe dados por props.
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type { Lesson } from "@/types/coordinator";
import { formatData } from "@/utils/format";
import { getLessonScheduleStatus } from "@/utils/getLessonScheduleStatus";

interface UpcomingLessonsListProps {
  lessons: Lesson[];
}

const getLessonStatusInfo = (lesson: Lesson) => {
  const status = getLessonScheduleStatus(lesson);

  if (status === "concluida") {
    return { label: "Concluída", tone: "green" as const };
  }

  if (status === "cancelada") {
    return { label: "Cancelada", tone: "red" as const };
  }

  if (status === "pendente") {
    return { label: "Pendente", tone: "amber" as const };
  }

  return { label: "Próxima", tone: "blue" as const };
};

export const UpcomingLessonsList = ({ lessons }: UpcomingLessonsListProps) => {
  return (
    <section
      aria-labelledby="upcoming-lessons-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex flex-col gap-y-1">
        <h2
          id="upcoming-lessons-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Próximas aulas
        </h2>
        <p className="text-slate-500 text-xs">
          Aulas planejadas e acompanhamento do cronograma.
        </p>
      </div>

      <div className="flex flex-col gap-y-3">
        {lessons.map((lesson) => {
          const status = getLessonStatusInfo(lesson);

          return (
            <article
              key={lesson.id}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-x-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">
                    Aula {lesson.numeroAula}
                  </p>
                  <p className="mt-1 text-slate-600 text-xs leading-5">
                    {lesson.titulo}
                  </p>
                </div>

                <CoordinatorStatusBadge
                  label={status.label}
                  tone={status.tone}
                />
              </div>

              <p className="mt-3 text-slate-500 text-xs">
                {formatData(lesson.data)}
              </p>
            </article>
          );
        })}

        {lessons.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-500 text-sm">
            Nenhuma aula planejada.
          </p>
        )}
      </div>
    </section>
  );
};
