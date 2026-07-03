"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { NewStudentForm } from "@/components/coordenador/NewStudentForm";
import { StudentTable } from "@/components/coordenador/StudentTable";
import { MATRICULA_STATUS } from "@/constants/matriculaStatus";
import type { ClassGroup, Course, Student } from "@/types/coordinator";

interface StudentsPageContentProps {
  students: Student[];
  courses: Course[];
  classes: ClassGroup[];
}

export const StudentsPageContent = ({
  students,
  courses,
  classes,
}: StudentsPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeStudents = students.filter(
    (student) => student.statusConta === "ativo",
  ).length;
  const pendingStudents = students.filter(
    (student) => student.statusConta === "pendente_ativacao",
  ).length;
  const studentsAtRisk = students.filter(
    (student) =>
      student.statusMatricula === MATRICULA_STATUS.REPROVADO_FALTA ||
      (student.statusMatricula === MATRICULA_STATUS.EM_ANDAMENTO &&
        student.frequencia < 75),
  ).length;

  return (
    <>
      <CoordinatorPageHeader
        title="Alunos"
        subtitle="Gerencie alunos, status de ativação e vínculo com turmas"
        action={
          <button
            type="button"
            onClick={() => setIsFormOpen((currentValue) => !currentValue)}
            aria-expanded={isFormOpen}
            className="h-11 w-full rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Novo Aluno
          </button>
        }
      />

      <NewStudentForm
        courses={courses}
        classes={classes}
        isOpen={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
      />

      <section
        aria-label="Indicadores de alunos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Total de alunos"
          value={students.length}
          subtitle="Alunos cadastrados"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Alunos ativos"
          value={activeStudents}
          subtitle="Com acesso liberado"
          variant="green"
        />
        <CoordinatorStatCard
          title="Pendentes de ativação"
          value={pendingStudents}
          subtitle="Aguardando confirmação"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Em risco por frequência"
          value={studentsAtRisk}
          subtitle="Abaixo do limite esperado"
          variant="amber"
        />
      </section>

      <StudentTable students={students} />
    </>
  );
};
