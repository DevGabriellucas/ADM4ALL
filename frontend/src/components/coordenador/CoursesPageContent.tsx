"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { CourseTable } from "@/components/coordenador/CourseTable";
import { NewCourseForm } from "@/components/coordenador/NewCourseForm";
import type { Course } from "@/types/coordinator";

interface CoursesPageContentProps {
  courses: Course[];
}

export const CoursesPageContent = ({ courses }: CoursesPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeCourses = courses.filter(
    (course) => course.status === "ativo",
  ).length;
  const completedCourses = courses.filter(
    (course) => course.status === "encerrado",
  ).length;
  const coursesWithoutClasses = courses.filter(
    (course) => course.quantidadeTurmas === 0,
  ).length;

  return (
    <>
      <CoordinatorPageHeader
        title="Cursos"
        subtitle="Gerencie os cursos disponíveis no ADM4All"
        action={
          <button
            type="button"
            onClick={() => setIsFormOpen((currentValue) => !currentValue)}
            aria-expanded={isFormOpen}
            className="h-11 w-full cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Novo Curso
          </button>
        }
      />

      <NewCourseForm
        isOpen={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
      />

      <section
        aria-label="Indicadores de cursos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Total de cursos"
          value={courses.length}
          subtitle="Cursos cadastrados"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Cursos ativos"
          value={activeCourses}
          subtitle="Disponíveis no período"
          variant="green"
        />
        <CoordinatorStatCard
          title="Cursos concluídos"
          value={completedCourses}
          subtitle="Cursos já encerrados"
          variant="blue"
        />
        <CoordinatorStatCard
          title="Cursos sem turma"
          value={coursesWithoutClasses}
          subtitle="Aguardando formação de turma"
          variant="amber"
        />
      </section>

      <CourseTable courses={courses} />
    </>
  );
};
