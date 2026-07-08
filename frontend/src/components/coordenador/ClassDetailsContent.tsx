"use client";

import Link from "next/link";
import { useState } from "react";
import { encerrarTurmaAction } from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AddInstructorToClassModal } from "@/components/coordenador/AddInstructorToClassModal";
import { ClassDetailsTabs } from "@/components/coordenador/ClassDetailsTabs";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { EditClassForm } from "@/components/coordenador/EditClassForm";
import { ManageClassStudentsModal } from "@/components/coordenador/ManageClassStudentsModal";
import type {
  AttendanceSummary,
  CertificateRecord,
  ClassGroup,
  ClassMaterial,
  Course,
  Instructor,
  Lesson,
  Student,
} from "@/types/coordinator";
import { getCertificateStatus } from "@/utils/getCertificateStatus";

interface ClassDetailsContentProps {
  classGroup: ClassGroup;
  students: Student[];
  lessons: Lesson[];
  attendance: AttendanceSummary[];
  materials: ClassMaterial[];
  certificates: CertificateRecord[];
  courses: Course[];
  instructors: Instructor[];
}

const classStatusInfo: Record<
  ClassGroup["status"],
  {
    label: string;
    tone: "green" | "amber" | "red" | "blue";
  }
> = {
  planejada: { label: "Planejada", tone: "amber" },
  em_andamento: { label: "Em andamento", tone: "blue" },
  concluida: { label: "Concluída", tone: "green" },
  encerrada: { label: "Encerrada", tone: "red" },
  cancelada: { label: "Cancelada", tone: "red" },
};

export const ClassDetailsContent = ({
  classGroup,
  students,
  lessons,
  attendance,
  materials,
  certificates,
  courses,
  instructors,
}: ClassDetailsContentProps) => {
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [closingClass, setClosingClass] = useState<ClassGroup | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [managingStudents, setManagingStudents] = useState<ClassGroup | null>(
    null,
  );
  const [addingInstructor, setAddingInstructor] = useState<ClassGroup | null>(
    null,
  );

  const status = classStatusInfo[classGroup.status];
  const completedLessons = lessons.filter(
    (lesson) => lesson.status === "realizada",
  ).length;
  const eligibleCertificates = certificates.filter((certificate) => {
    const status = getCertificateStatus(certificate);
    return status !== "nao_elegivel" && status !== "cancelado";
  }).length;

  const handleCloseConfirm = async () => {
    if (!closingClass) return;

    setIsClosing(true);
    setCloseError(null);

    const resultado = await encerrarTurmaAction(closingClass.id);

    setIsClosing(false);

    if (!resultado.sucesso) {
      setCloseError(resultado.mensagem);
      return;
    }

    setClosingClass(null);
    setCloseError(null);
  };

  return (
    <>
      {editingClass && (
        <EditClassForm
          classGroup={editingClass}
          courses={courses}
          instructors={instructors}
          onCancel={() => setEditingClass(null)}
          onSuccess={() => setEditingClass(null)}
        />
      )}

      {closingClass && (
        <ConfirmDialog
          title="Encerrar turma?"
          description="Esta ação marcará a turma como encerrada. Revise presenças, alunos e certificados antes de confirmar."
          confirmLabel={isClosing ? "Encerrando..." : "Encerrar turma"}
          cancelLabel="Cancelar"
          tone="danger"
          isLoading={isClosing}
          onCancel={() => {
            setClosingClass(null);
            setCloseError(null);
          }}
          onConfirm={handleCloseConfirm}
        />
      )}

      {managingStudents && (
        <ManageClassStudentsModal
          classGroup={managingStudents}
          onClose={() => setManagingStudents(null)}
        />
      )}

      {addingInstructor && (
        <AddInstructorToClassModal
          classGroup={addingInstructor}
          instructors={instructors}
          onClose={() => setAddingInstructor(null)}
        />
      )}

      {closeError && (
        <output
          aria-live="polite"
          className="mb-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
        >
          {closeError}
        </output>
      )}

      <header className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <Link
          href="/coordenador/turmas"
          className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
        >
          Voltar para turmas
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-semibold text-2xl text-slate-950">
                {classGroup.nome}
              </h1>
              <CoordinatorStatusBadge label={status.label} tone={status.tone} />
            </div>
            <p className="mt-2 text-slate-600 text-sm">{classGroup.curso}</p>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Instrutores
              </dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {classGroup.instrutores || "-"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Período letivo
              </dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {classGroup.periodoLetivo || "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setEditingClass(classGroup)}
            className="h-10 cursor-pointer rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
          >
            Editar turma
          </button>
          <button
            type="button"
            onClick={() => setManagingStudents(classGroup)}
            className="h-10 cursor-pointer rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
          >
            Adicionar aluno
          </button>
          <button
            type="button"
            onClick={() => setAddingInstructor(classGroup)}
            className="h-10 cursor-pointer rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
          >
            Adicionar instrutor
          </button>
          {classGroup.status === "em_andamento" && (
            <button
              type="button"
              onClick={() => setClosingClass(classGroup)}
              className="h-10 cursor-pointer rounded-lg bg-red-600 px-4 font-semibold text-sm text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
            >
              Encerrar turma
            </button>
          )}
        </div>
      </header>

      <section
        aria-label="Indicadores da turma"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Total de alunos"
          value={classGroup.alunos}
          subtitle="Alunos matriculados na turma"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Frequência média"
          value={`${classGroup.frequenciaMedia}%`}
          subtitle="Média consolidada da turma"
          variant="green"
        />
        <CoordinatorStatCard
          title="Aulas concluídas"
          value={completedLessons}
          subtitle={`${lessons.length} aulas no cronograma`}
          variant="blue"
        />
        <CoordinatorStatCard
          title="Certificados elegíveis"
          value={eligibleCertificates}
          subtitle="Pendentes ou já emitidos"
          variant="amber"
        />
      </section>

      <ClassDetailsTabs
        students={students}
        lessons={lessons}
        attendance={attendance}
        materials={materials}
        certificates={certificates}
      />
    </>
  );
};
