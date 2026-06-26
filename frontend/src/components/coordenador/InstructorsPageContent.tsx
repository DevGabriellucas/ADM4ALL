"use client";

import { useState } from "react";
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl text-slate-950">Instrutores</h1>
          <p className="mt-1 text-slate-600 text-sm">
            Gerencie instrutores, vínculos e convites de ativação
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((currentValue) => !currentValue)}
          aria-expanded={isFormOpen}
          className="h-11 w-full rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] sm:w-auto"
        >
          + Novo Instrutor
        </button>
      </header>

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
