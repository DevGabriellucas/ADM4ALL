"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { ScheduleTable } from "@/components/coordenador/ScheduleTable";
import type {
  ClassGroup,
  Course,
  Instructor,
  Lesson,
  LessonScheduleStatus,
} from "@/types/coordinator";
import { getLessonScheduleStatus } from "@/utils/getLessonScheduleStatus";

interface SchedulePageContentProps {
  lessons: Lesson[];
  courses: Course[];
  classes: ClassGroup[];
  instructors: Instructor[];
}

export const SchedulePageContent = ({
  lessons,
  courses,
  classes,
  instructors,
}: SchedulePageContentProps) => {
  const [courseFilter, setCourseFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<LessonScheduleStatus | "">(
    "",
  );

  const availableClasses = classes.filter(
    (classGroup) => !courseFilter || classGroup.curso === courseFilter,
  );
  const filteredLessons = lessons
    .filter((lesson) => {
      if (courseFilter && lesson.curso !== courseFilter) {
        return false;
      }
      if (classFilter && lesson.turma !== classFilter) {
        return false;
      }
      if (instructorFilter && lesson.instrutor !== instructorFilter) {
        return false;
      }
      if (statusFilter && getLessonScheduleStatus(lesson) !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort(
      (firstLesson, secondLesson) =>
        new Date(firstLesson.data).getTime() -
        new Date(secondLesson.data).getTime(),
    );

  const completedLessons = filteredLessons.filter(
    (lesson) => getLessonScheduleStatus(lesson) === "concluida",
  ).length;
  const upcomingLessons = filteredLessons.filter(
    (lesson) => getLessonScheduleStatus(lesson) === "proxima",
  ).length;
  const pendingLessons = filteredLessons.filter(
    (lesson) => getLessonScheduleStatus(lesson) === "pendente",
  ).length;
  const canceledLessons = filteredLessons.filter(
    (lesson) => getLessonScheduleStatus(lesson) === "cancelada",
  ).length;

  return (
    <>
      <CoordinatorPageHeader
        title="Cronograma"
        subtitle="Acompanhe o planejamento das aulas por turma"
      />

      <section
        aria-label="Filtros do cronograma"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Curso
            <select
              value={courseFilter}
              onChange={(event) => {
                setCourseFilter(event.target.value);
                setClassFilter("");
              }}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.nome}>
                  {course.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Turma
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todas as turmas</option>
              {availableClasses.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.nome}>
                  {classGroup.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Instrutor
            <select
              value={instructorFilter}
              onChange={(event) => setInstructorFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os instrutores</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.nome}>
                  {instructor.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Status da aula
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as LessonScheduleStatus | "")
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os status</option>
              <option value="concluida">Concluída</option>
              <option value="proxima">Próxima</option>
              <option value="pendente">Pendente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
        </div>
      </section>

      <section
        aria-label="Indicadores do cronograma"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Aulas concluídas"
          value={completedLessons}
          subtitle="Aulas já realizadas"
          variant="green"
        />
        <CoordinatorStatCard
          title="Próximas aulas"
          value={upcomingLessons}
          subtitle="Planejadas para os próximos dias"
          variant="blue"
        />
        <CoordinatorStatCard
          title="Aulas pendentes"
          value={pendingLessons}
          subtitle="Planejadas com data vencida"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Aulas canceladas"
          value={canceledLessons}
          subtitle="Retiradas do cronograma"
          variant="neutral"
        />
      </section>

      <ScheduleTable lessons={filteredLessons} />
    </>
  );
};
