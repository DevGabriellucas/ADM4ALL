"use client";

import { useState } from "react";
import { desativarCursoAction } from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { CourseTable } from "@/components/coordenador/CourseTable";
import { EditCourseForm } from "@/components/coordenador/EditCourseForm";
import { NewCourseForm } from "@/components/coordenador/NewCourseForm";
import type { Course } from "@/types/coordinator";

interface CoursesPageContentProps {
  courses: Course[];
}

export const CoursesPageContent = ({ courses }: CoursesPageContentProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deactivatingCourse, setDeactivatingCourse] = useState<Course | null>(
    null,
  );
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivationError, setDeactivationError] = useState<string | null>(
    null,
  );

  const activeCourses = courses.filter(
    (course) => course.status === "ativo",
  ).length;
  const deactivatedCourses = courses.filter(
    (course) => course.status === "desativado",
  ).length;
  const coursesWithoutClasses = courses.filter(
    (course) => course.quantidadeTurmas === 0,
  ).length;

  const handleDeactivateConfirm = async () => {
    if (!deactivatingCourse) return;

    setIsDeactivating(true);
    setDeactivationError(null);

    const resultado = await desativarCursoAction(deactivatingCourse.id);

    setIsDeactivating(false);

    if (!resultado.sucesso) {
      setDeactivationError(resultado.mensagem);
      return;
    }

    setDeactivatingCourse(null);
    setDeactivationError(null);
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

      {editingCourse && (
        <EditCourseForm
          course={editingCourse}
          onCancel={() => setEditingCourse(null)}
          onSuccess={() => setEditingCourse(null)}
        />
      )}

      {deactivatingCourse && (
        <ConfirmDialog
          title="Desativar curso?"
          description="O curso deixará de aparecer como ativo, mas os registros vinculados serão preservados."
          confirmLabel={isDeactivating ? "Desativando..." : "Desativar"}
          cancelLabel="Cancelar"
          tone="danger"
          isLoading={isDeactivating}
          onCancel={() => {
            setDeactivatingCourse(null);
            setDeactivationError(null);
          }}
          onConfirm={handleDeactivateConfirm}
        />
      )}

      {deactivationError && (
        <output
          aria-live="polite"
          className="mt-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
        >
          {deactivationError}
        </output>
      )}

      <section
        aria-label="Indicadores de cursos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
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
        onEdit={(course) => setEditingCourse(course)}
        onDeactivate={(course) => setDeactivatingCourse(course)}
      />
    </>
  );
};
