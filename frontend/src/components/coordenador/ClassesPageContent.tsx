"use client";

import { useState } from "react";
import { ClassTable } from "@/components/coordenador/ClassTable";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { NewClassForm } from "@/components/coordenador/NewClassForm";
import type { ClassGroup, Course, Instructor } from "@/types/coordinator";

interface ClassesPageContentProps {
  classes: ClassGroup[];
  courses: Course[];
  instructors: Instructor[];
}

export const ClassesPageContent = ({
  classes,
  courses,
  instructors,
}: ClassesPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeClasses = classes.filter(
    (classGroup) => classGroup.status === "em_andamento",
  );
  const completedClasses = classes.filter(
    (classGroup) => classGroup.status === "concluida",
  ).length;
  const enrolledStudents = classes
    .filter(
      (classGroup) =>
        classGroup.status === "em_andamento" ||
        classGroup.status === "planejada",
    )
    .reduce((total, classGroup) => total + classGroup.alunos, 0);
  const averageAttendance =
    activeClasses.length > 0
      ? Math.round(
          activeClasses.reduce(
            (total, classGroup) => total + classGroup.frequenciaMedia,
            0,
          ) / activeClasses.length,
        )
      : 0;

  return (
    <>
      <CoordinatorPageHeader
        title="Turmas"
        subtitle="Gerencie turmas, instrutores e alunos vinculados"
        action={
          <button
            type="button"
            onClick={() => setIsFormOpen((currentValue) => !currentValue)}
            aria-expanded={isFormOpen}
            className="h-11 w-full cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Nova Turma
          </button>
        }
      />

      <NewClassForm
        courses={courses}
        instructors={instructors}
        isOpen={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
      />

      <section
        aria-label="Indicadores de turmas"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Turmas ativas"
          value={activeClasses.length}
          subtitle="Em andamento"
          variant="green"
        />
        <CoordinatorStatCard
          title="Alunos matriculados"
          value={enrolledStudents}
          subtitle="Em turmas ativas e planejadas"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Frequência média"
          value={`${averageAttendance}%`}
          subtitle="Média das turmas ativas"
          variant="blue"
        />
        <CoordinatorStatCard
          title="Turmas concluídas"
          value={completedClasses}
          subtitle="Com período encerrado"
          variant="amber"
        />
      </section>

      <ClassTable classes={classes} />
    </>
  );
};
