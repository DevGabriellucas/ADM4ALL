"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { InstructorTable } from "@/components/coordenador/InstructorTable";
import { NewInstructorForm } from "@/components/coordenador/NewInstructorForm";
import { Paginacao } from "@/components/shared/Paginacao";
import type { PaginaDeInstrutores } from "@/types/coordinator";

interface InstructorsPageContentProps {
  pagina: PaginaDeInstrutores;
}

export const InstructorsPageContent = ({
  pagina,
}: InstructorsPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // A tabela mostra a pagina; os cartoes contam a base inteira e vem do
  // servidor.
  const instructors = pagina.itens;
  const activeInstructors = pagina.resumo.ativos;
  const pendingInvites = pagina.resumo.pendentes;
  const linkedClasses = pagina.resumo.turmasVinculadas;

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
            className="h-11 w-full rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
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
          value={pagina.total}
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

      <Paginacao
        pagina={pagina.pagina}
        porPagina={pagina.porPagina}
        total={pagina.total}
        href="/coordenador/instrutores"
        rotulo="instrutor"
        rotuloPlural="instrutores"
      />
    </>
  );
};
