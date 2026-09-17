"use client";

import { useEffect, useState } from "react";
import { excluirCursoAction } from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { CourseTable } from "@/components/coordenador/CourseTable";
import { NewCourseForm } from "@/components/coordenador/NewCourseForm";
import { Notificacao } from "@/components/shared/Notificacao";
import type { Course } from "@/types/coordinator";

interface CoursesPageContentProps {
  courses: Course[];
}

export const CoursesPageContent = ({ courses }: CoursesPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);

  useEffect(() => {
    if (!deletionError) return;
    const timeout = window.setTimeout(() => setDeletionError(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [deletionError]);

  const activeCourses = courses.filter(
    (course) => course.status === "ativo",
  ).length;
  const deactivatedCourses = courses.filter(
    (course) => course.status === "desativado",
  ).length;
  // Sem este contador os cartoes nao somavam o total: um curso em planejamento
  // nao aparecia nem como ativo nem como desativado.
  const plannedCourses = courses.filter(
    (course) => course.status === "em_planejamento",
  ).length;
  const coursesWithoutClasses = courses.filter(
    (course) => course.quantidadeTurmas === 0,
  ).length;

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
            className="h-11 w-full cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Novo Curso
          </button>
        }
      />

      <NewCourseForm
        isOpen={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
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

      {deletionError && (
        <Notificacao
          tipo="erro"
          className="-translate-x-1/2 fixed top-4 left-1/2 z-[60] w-[min(92vw,42rem)] shadow-lg"
        >
          {deletionError}
        </Notificacao>
      )}

      <section
        aria-label="Indicadores de cursos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <CoordinatorStatCard
          title="Total de cursos"
          value={courses.length}
          subtitle="Cursos cadastrados"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Cursos ativos"
          value={activeCourses}
          subtitle="Disponíveis no período"
          variant="green"
        />
        <CoordinatorStatCard
          title="Em planejamento"
          value={plannedCourses}
          subtitle="Ainda não abertos"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Cursos desativados"
          value={deactivatedCourses}
          subtitle="Fora de oferta"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Cursos sem turma"
          value={coursesWithoutClasses}
          subtitle="Aguardando formação de turma"
          variant="amber"
        />
      </section>

      <CourseTable
        courses={courses}
        onDelete={(course) => setDeletingCourse(course)}
      />
    </>
  );
};
