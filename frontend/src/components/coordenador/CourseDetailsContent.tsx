"use client";

import Link from "next/link";
import { useState } from "react";
import { desativarCursoAction } from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { EditCourseForm } from "@/components/coordenador/EditCourseForm";
import { NewClassForm } from "@/components/coordenador/NewClassForm";
import type { ClassGroup, Course, Instructor } from "@/types/coordinator";

interface CourseDetailsContentProps {
  course: Course;
  classes: ClassGroup[];
  instructors: Instructor[];
}

const getCourseStatusInfo = (status: Course["status"]) => {
  if (status === "ativo") {
    return { label: "Ativo", tone: "green" as const };
  }

  if (status === "em_planejamento") {
    return { label: "Em planejamento", tone: "blue" as const };
  }

  return { label: "Desativado", tone: "slate" as const };
};

const getClassStatusInfo = (status: ClassGroup["status"]) => {
  const map: Record<
    ClassGroup["status"],
    { label: string; tone: "green" | "blue" | "amber" | "slate" }
  > = {
    planejada: { label: "Planejada", tone: "blue" },
    em_andamento: { label: "Em andamento", tone: "green" },
    concluida: { label: "Concluída", tone: "amber" },
    cancelada: { label: "Cancelada", tone: "slate" },
  };

  return map[status];
};

export const CourseDetailsContent = ({
  course,
  classes,
  instructors,
}: CourseDetailsContentProps) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deactivatingCourse, setDeactivatingCourse] = useState<Course | null>(
    null,
  );
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivationError, setDeactivationError] = useState<string | null>(
    null,
  );
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);

  const status = getCourseStatusInfo(course.status);

  const activeClasses = classes.filter(
    (c) => c.status === "em_andamento",
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

      {isNewClassModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-class-modal-title"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-12"
        >
          <div className="w-full max-w-2xl">
            <NewClassForm
              courses={[course]}
              instructors={instructors}
              isOpen={isNewClassModalOpen}
              defaultCourseName={course.nome}
              defaultCourseId={course.id}
              lockCourse={true}
              onCancel={() => setIsNewClassModalOpen(false)}
              onSuccess={() => setIsNewClassModalOpen(false)}
            />
          </div>
        </div>
      )}

      {deactivationError && (
        <output
          aria-live="polite"
          className="mb-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
        >
          {deactivationError}
        </output>
      )}

      <section
        aria-labelledby="course-detail-heading"
        className="rounded-lg border border-[#D5DDEC] bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              id="course-detail-heading"
              className="font-semibold text-slate-900 text-xl"
            >
              {course.nome}
            </h1>
            <p className="mt-1 max-w-2xl text-slate-500 text-sm leading-6">
              {course.descricao}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CoordinatorStatusBadge label={status.label} tone={status.tone} />
            <button
              type="button"
              onClick={() => setEditingCourse(course)}
              className="h-11 cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
            >
              Editar
            </button>
            {course.status !== "desativado" && (
              <button
                type="button"
                onClick={() => setDeactivatingCourse(course)}
                className="h-11 cursor-pointer rounded-lg bg-red-600 px-5 font-semibold text-sm text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
              >
                Desativar
              </button>
            )}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="font-medium text-slate-500 text-xs uppercase tracking-wider">
              Carga horária
            </dt>
            <dd className="mt-1 font-semibold text-lg text-slate-900">
              {course.cargaHoraria}h
            </dd>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="font-medium text-slate-500 text-xs uppercase tracking-wider">
              Turmas vinculadas
            </dt>
            <dd className="mt-1 font-semibold text-lg text-slate-900">
              {classes.length}
            </dd>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="font-medium text-slate-500 text-xs uppercase tracking-wider">
              Turmas ativas
            </dt>
            <dd className="mt-1 font-semibold text-lg text-slate-900">
              {activeClasses}
            </dd>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="font-medium text-slate-500 text-xs uppercase tracking-wider">
              Status
            </dt>
            <dd className="mt-1">
              <CoordinatorStatusBadge label={status.label} tone={status.tone} />
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="course-classes-heading"
        className="mt-6 rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="course-classes-heading"
              className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
            >
              Turmas vinculadas
            </h2>
            <p className="mt-1 text-slate-500 text-xs">
              Turmas que pertencem a este curso.
            </p>
          </div>
          {course.status === "desativado" ? (
            <button
              type="button"
              disabled
              title="Nao e possivel criar turma para um curso desativado."
              className="h-11 cursor-not-allowed rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white opacity-50"
            >
              + Nova turma
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsNewClassModalOpen(true)}
              className="h-11 cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
            >
              + Nova turma
            </button>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="rounded-lg border border-slate-300 border-dashed px-4 py-8 text-center">
            <p className="text-slate-500 text-sm">
              Nenhuma turma vinculada a este curso.
            </p>
            {course.status !== "desativado" && (
              <button
                type="button"
                onClick={() => setIsNewClassModalOpen(true)}
                className="mt-3 cursor-pointer font-semibold text-brand-dark text-sm transition-colors hover:text-[#23275F] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
              >
                Criar turma para este curso
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl border-separate border-spacing-0 border-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Turma
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Instrutores
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Período
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Status
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Alunos
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classGroup) => {
                  const classStatus = getClassStatusInfo(classGroup.status);

                  return (
                    <tr key={classGroup.id}>
                      <td className="border-slate-100 border-b px-3 py-3">
                        <p className="font-medium text-slate-900">
                          {classGroup.nome}
                        </p>
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {classGroup.instrutores || "-"}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {classGroup.dataInicio}
                        {classGroup.dataTermino
                          ? ` - ${classGroup.dataTermino}`
                          : ""}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3">
                        <CoordinatorStatusBadge
                          label={classStatus.label}
                          tone={classStatus.tone}
                        />
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {classGroup.alunos}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3">
                        <Link
                          href={`/coordenador/turmas/${classGroup.id}`}
                          className="cursor-pointer font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
                        >
                          Ver turma
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};
