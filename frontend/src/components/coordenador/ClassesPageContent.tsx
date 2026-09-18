"use client";

import { useState } from "react";
import { ClassTable } from "@/components/coordenador/ClassTable";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { NewClassForm } from "@/components/coordenador/NewClassForm";
import type {
  ClassStatus,
  Course,
  Instructor,
  PaginaDeTurmas,
} from "@/types/coordinator";

interface DefaultClassValues {
  periodoLetivo?: string;
  capacidade?: string;
  status?: ClassStatus;
}

interface ClassesPageContentProps {
  pagina: PaginaDeTurmas;
  courses: Course[];
  instructors: Instructor[];
  defaultClassValues?: DefaultClassValues;
}

export const ClassesPageContent = ({
  pagina,
  courses,
  instructors,
  defaultClassValues,
}: ClassesPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // A tabela mostra a pagina; os cartoes contam a base inteira e vem do
  // servidor, que aplica as mesmas regras de antes — turma sem chamada fica
  // fora da media, senao ela entrava como 0% e derrubava o indicador.
  const classes = pagina.itens;
  const activeClassesCount = pagina.resumo.emAndamento;
  const completedClasses = pagina.resumo.encerradas;
  const enrolledStudents = pagina.resumo.matriculados;
  const averageAttendance = pagina.resumo.mediaFrequencia;

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
            className="h-11 w-full cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
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
        defaultValues={defaultClassValues}
      />

      <section
        aria-label="Indicadores de turmas"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Turmas ativas"
          value={activeClassesCount}
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
          subtitle={
            averageAttendance > 0
              ? "Média das turmas em andamento com chamada"
              : "Nenhuma turma com chamada registrada"
          }
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
