"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { NewStudentForm } from "@/components/coordenador/NewStudentForm";
import { StudentTable } from "@/components/coordenador/StudentTable";
import { Paginacao } from "@/components/shared/Paginacao";
import type { ClassGroup, Course, PaginaDeAlunos } from "@/types/coordinator";

interface StudentsPageContentProps {
  pagina: PaginaDeAlunos;
  courses: Course[];
  classes: ClassGroup[];
}

export const StudentsPageContent = ({
  pagina,
  courses,
  classes,
}: StudentsPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // A tabela mostra a pagina; os cartoes contam a base inteira e vem do
  // servidor, que aplica as mesmas regras de antes — inclusive a de risco, que
  // ignora turma encerrada porque o aluno ja fechou como Aprovado ou Reprovado
  // e nao ha mais o que a coordenacao faca.
  const students = pagina.itens;
  const activeStudents = pagina.resumo.ativos;
  const pendingStudents = pagina.resumo.pendentes;
  const studentsAtRisk = pagina.resumo.emRisco;

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
            className="h-11 w-full rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
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
          value={pagina.total}
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

      <Paginacao
        pagina={pagina.pagina}
        porPagina={pagina.porPagina}
        total={pagina.total}
        href="/coordenador/alunos"
        rotulo="aluno"
      />
    </>
  );
};
