"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { InstructorTable } from "@/components/coordenador/InstructorTable";
import { NewInstructorForm } from "@/components/coordenador/NewInstructorForm";
import type { Instructor } from "@/types/coordinator";

interface InstructorsPageContentProps {
  instructors: Instructor[];
}

export const InstructorsPageContent = ({
  instructors,
}: InstructorsPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeInstructors = instructors.filter(
    (instructor) => instructor.status === "ativo",
  ).length;
  const pendingInvites = instructors.filter(
    (instructor) => instructor.status === "pendente_ativacao",
  ).length;
  const linkedClasses = instructors.reduce(
    (total, instructor) => total + instructor.turmasVinculadas,
    0,
  );

  return (
    <>
      <CoordinatorPageHeader
        title="Instrutores"
        subtitle="Gerencie instrutores, vínculos e convites de ativação"
        action={
          <button
            type="button"
            onClick={() => setIsFormOpen((currentValue) => !currentValue)}
            aria-expanded={isFormOpen}
            className="h-11 w-full rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Novo Instrutor
          </button>
        }
      />

      <NewInstructorForm
        isOpen={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
      />

      <section
        aria-label="Indicadores de instrutores"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Total de instrutores"
          value={instructors.length}
          subtitle="Instrutores cadastrados"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Instrutores ativos"
          value={activeInstructors}
          subtitle="Com acesso liberado"
          variant="green"
        />
        <CoordinatorStatCard
          title="Convites pendentes"
          value={pendingInvites}
          subtitle="Aguardando ativação"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Turmas vinculadas"
          value={linkedClasses}
          subtitle="Vínculos ativos e planejados"
          variant="blue"
        />
      </section>

      <InstructorTable instructors={instructors} />
    </>
  );
};
