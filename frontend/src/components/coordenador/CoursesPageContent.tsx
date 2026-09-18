"use client";

import { useEffect, useState } from "react";
import { excluirCursoAction } from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { CourseTable } from "@/components/coordenador/CourseTable";
import { NewCourseForm } from "@/components/coordenador/NewCourseForm";
import {
  Notificacao,
  PRAZO_PARA_LIMPAR_AVISO,
} from "@/components/shared/Notificacao";
import { Paginacao } from "@/components/shared/Paginacao";
import type { Course, PaginaDeCursos } from "@/types/coordinator";

interface CoursesPageContentProps {
  pagina: PaginaDeCursos;
  periodoLetivoPadrao?: string;
}

export const CoursesPageContent = ({
  pagina,
  periodoLetivoPadrao,
}: CoursesPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);

  useEffect(() => {
    if (!deletionError) return;
    const timeout = window.setTimeout(
      () => setDeletionError(null),
      PRAZO_PARA_LIMPAR_AVISO,
    );
    return () => window.clearTimeout(timeout);
  }, [deletionError]);

  // A tabela mostra a pagina; os cartoes contam a base inteira e vem do
  // servidor. Contar sobre `itens` faria os numeros mudarem a cada pagina.
  const courses = pagina.itens;
  const { resumo } = pagina;

  const handleDeleteConfirm = async () => {
    if (!deletingCourse) return;

    setIsDeleting(true);
    setDeletionError(null);

    const resultado = await excluirCursoAction(deletingCourse.id);

    setIsDeleting(false);

    if (!resultado.sucesso) {
      setDeletingCourse(null);
      setDeletionError(resultado.mensagem);
      return;
    }

    setDeletingCourse(null);
    setDeletionError(null);
  };

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
            className="h-11 w-full cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Novo Curso
          </button>
        }
      />

      <NewCourseForm
        isOpen={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        periodoLetivoPadrao={periodoLetivoPadrao}
      />

      {deletingCourse && (
        <ConfirmDialog
          title="Excluir curso?"
          description={`O curso "${deletingCourse.nome}" será apagado do sistema. Essa ação não pode ser desfeita. Cursos com turma ou matrícula vinculada não podem ser excluídos.`}
          confirmLabel={isDeleting ? "Excluindo..." : "Excluir"}
          cancelLabel="Cancelar"
          tone="danger"
          isLoading={isDeleting}
          onCancel={() => {
            setDeletingCourse(null);
            setDeletionError(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {deletionError && <Notificacao tipo="erro">{deletionError}</Notificacao>}

      <section
        aria-label="Indicadores de cursos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        <CoordinatorStatCard
          title="Total de cursos"
          value={pagina.total}
          subtitle="Cursos cadastrados"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Cursos ativos"
          value={resumo.ativos}
          subtitle="Com turma e aluno"
          variant="green"
        />
        <CoordinatorStatCard
          title="Em planejamento"
          value={resumo.emPlanejamento}
          subtitle="Ainda sem turma com aluno"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Cursos encerrados"
          value={resumo.encerrados}
          subtitle="Turmas no fim do cronograma"
          variant="red"
        />
        <CoordinatorStatCard
          title="Cursos desativados"
          value={resumo.desativados}
          subtitle="Turmas canceladas"
          variant="red"
        />
        <CoordinatorStatCard
          title="Cursos sem turma"
          value={resumo.semTurma}
          subtitle="Aguardando formação de turma"
          variant="amber"
        />
      </section>

      <CourseTable
        courses={courses}
        onDelete={(course) => setDeletingCourse(course)}
      />

      <Paginacao
        pagina={pagina.pagina}
        porPagina={pagina.porPagina}
        total={pagina.total}
        href="/coordenador/cursos"
        rotulo="curso"
      />
    </>
  );
};
