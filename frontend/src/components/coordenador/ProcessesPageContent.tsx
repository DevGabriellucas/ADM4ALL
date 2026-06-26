"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { NewProcessForm } from "@/components/coordenador/NewProcessForm";
import { ProcessTable } from "@/components/coordenador/ProcessTable";
import type { BaseUser, ProcessRecord } from "@/types/coordinator";

interface ProcessesPageContentProps {
  processes: ProcessRecord[];
  users: BaseUser[];
}

export const ProcessesPageContent = ({
  processes,
  users,
}: ProcessesPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeProcesses = processes.filter(
    (process) => process.status === "aberto" || process.status === "em_analise",
  ).length;
  const inProgressProcesses = processes.filter(
    (process) => process.status === "em_analise",
  ).length;
  const completedProcesses = processes.filter(
    (process) => process.status === "concluido",
  ).length;
  const pendingProcesses = processes.filter(
    (process) => process.status === "aberto",
  ).length;

  return (
    <>
      <CoordinatorPageHeader
        title="Processos"
        subtitle="Acompanhe processos administrativos e acadêmicos"
        action={
          <button
            type="button"
            onClick={() => setIsFormOpen((currentValue) => !currentValue)}
            aria-expanded={isFormOpen}
            className="h-11 w-full rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Novo Processo
          </button>
        }
      />

      <NewProcessForm
        users={users}
        isOpen={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
      />

      <section
        aria-label="Indicadores de processos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Processos ativos"
          value={activeProcesses}
          subtitle="Pendentes ou em andamento"
          variant="blue"
        />
        <CoordinatorStatCard
          title="Em andamento"
          value={inProgressProcesses}
          subtitle="Em análise pelos responsáveis"
          variant="green"
        />
        <CoordinatorStatCard
          title="Concluídos"
          value={completedProcesses}
          subtitle="Processos finalizados"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Pendentes"
          value={pendingProcesses}
          subtitle="Aguardando início"
          variant="amber"
        />
      </section>

      <ProcessTable processes={processes} />
    </>
  );
};
