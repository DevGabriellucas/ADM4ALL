"use client";

import { useState } from "react";
import { ClassTable } from "@/components/coordenador/ClassTable";
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
    (classGroup) => classGroup.status === "encerrada",
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl text-slate-950">Turmas</h1>
          <p className="mt-1 text-slate-600 text-sm">
            Gerencie turmas, instrutores e alunos vinculados
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((currentValue) => !currentValue)}
          aria-expanded={isFormOpen}
          className="h-11 w-full rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] sm:w-auto"
        >
          + Nova Turma
        </button>
      </header>

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
