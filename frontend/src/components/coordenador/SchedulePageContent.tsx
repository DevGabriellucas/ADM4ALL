"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  atualizarAulaCronogramaAction,
  criarAulaCronogramaAction,
  removerAulaCronogramaAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { ScheduleTable } from "@/components/coordenador/ScheduleTable";
import type {
  ClassGroup,
  Course,
  Instructor,
  Lesson,
  LessonScheduleStatus,
} from "@/types/coordinator";
import { getLessonScheduleStatus } from "@/utils/getLessonScheduleStatus";

interface SchedulePageContentProps {
  lessons: Lesson[];
  courses: Course[];
  classes: ClassGroup[];
  instructors: Instructor[];
}

type Feedback = { tipo: "ok" | "erro"; texto: string } | null;

export const SchedulePageContent = ({
  lessons,
  courses,
  classes,
  instructors,
}: SchedulePageContentProps) => {
  const router = useRouter();
  const [courseFilter, setCourseFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<LessonScheduleStatus | "">(
    "",
  );
  const [turmaNovaAulaId, setTurmaNovaAulaId] = useState("");
  const [tituloNovaAula, setTituloNovaAula] = useState("");
  const [dataNovaAula, setDataNovaAula] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [lessonParaRemover, setLessonParaRemover] = useState<Lesson | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const availableClasses = classes.filter(
    (classGroup) => !courseFilter || classGroup.curso === courseFilter,
  );
  const filteredLessons = lessons
    .filter((lesson) => {
      if (courseFilter && lesson.curso !== courseFilter) return false;
      if (classFilter && lesson.turma !== classFilter) return false;
      if (instructorFilter && lesson.instrutor !== instructorFilter) {
        return false;
      }
      if (statusFilter && getLessonScheduleStatus(lesson) !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort(
      (firstLesson, secondLesson) =>
        new Date(firstLesson.data).getTime() -
        new Date(secondLesson.data).getTime(),
    );

  const completedLessons = filteredLessons.filter(
    (lesson) => getLessonScheduleStatus(lesson) === "concluida",
  ).length;
  const upcomingLessons = filteredLessons.filter(
    (lesson) => getLessonScheduleStatus(lesson) === "proxima",
  ).length;
  const pendingLessons = filteredLessons.filter(
    (lesson) => getLessonScheduleStatus(lesson) === "pendente",
  ).length;
  const canceledLessons = filteredLessons.filter(
    (lesson) => getLessonScheduleStatus(lesson) === "cancelada",
  ).length;

  const finalizarAcao = (resultado: { sucesso: boolean; mensagem: string }) => {
    setFeedback({
      tipo: resultado.sucesso ? "ok" : "erro",
      texto: resultado.mensagem,
    });

    if (resultado.sucesso) {
      router.refresh();
    }
  };

  const criarAula = () => {
    if (!turmaNovaAulaId || !tituloNovaAula.trim() || !dataNovaAula) {
      setFeedback({
        tipo: "erro",
        texto: "Informe turma, titulo e data para cadastrar a aula.",
      });
      return;
    }

    startTransition(async () => {
      const resultado = await criarAulaCronogramaAction({
        turmaId: turmaNovaAulaId,
        titulo: tituloNovaAula.trim(),
        data: dataNovaAula,
      });
      if (resultado.sucesso) {
        setTituloNovaAula("");
        setDataNovaAula("");
      }
      finalizarAcao(resultado);
    });
  };

  const editarAula = (lesson: Lesson) => {
    if (!lesson.turmaId) return;

    const novoTitulo = window.prompt("Título da aula", lesson.titulo);
    if (novoTitulo === null) return;

    const novaData = window.prompt("Data da aula (AAAA-MM-DD)", lesson.data);
    if (novaData === null) return;

    startTransition(async () => {
      const resultado = await atualizarAulaCronogramaAction(
        lesson.turmaId!,
        lesson.id,
        {
          titulo: novoTitulo.trim(),
          data: novaData.trim(),
        },
      );
      finalizarAcao(resultado);
    });
  };

  const atualizarStatusAula = (
    lesson: Lesson,
    status: Lesson["status"],
  ) => {
    if (!lesson.turmaId) return;

    startTransition(async () => {
      const resultado = await atualizarAulaCronogramaAction(
        lesson.turmaId!,
        lesson.id,
        { status },
      );
      finalizarAcao(resultado);
    });
  };

  const removerAula = (lesson: Lesson) => {
    if (!lesson.turmaId) return;

    setLessonParaRemover(lesson);
  };

  const confirmarRemocaoAula = (lesson: Lesson) => {
    if (!lesson.turmaId) return;

    setLessonParaRemover(null);
    startTransition(async () => {
      const resultado = await removerAulaCronogramaAction(
        lesson.turmaId!,
        lesson.id,
      );
      finalizarAcao(resultado);
    });
  };

  return (
    <>
      <CoordinatorPageHeader
        title="Cronograma"
        subtitle="Acompanhe o planejamento das aulas por turma"
      />

      <section
        aria-label="Nova aula"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1.5fr_1fr_auto]">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Turma
            <select
              value={turmaNovaAulaId}
              onChange={(event) => setTurmaNovaAulaId(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Selecione</option>
              {classes.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {classGroup.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Titulo
            <input
              type="text"
              value={tituloNovaAula}
              onChange={(event) => setTituloNovaAula(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Data
            <input
              type="date"
              value={dataNovaAula}
              onChange={(event) => setDataNovaAula(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={criarAula}
              disabled={isPending}
              className="h-10 rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </div>

        {feedback && (
          <output
            className={`mt-4 block rounded-lg border px-4 py-3 text-sm ${
              feedback.tipo === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {feedback.texto}
          </output>
        )}
      </section>

      <section
        aria-label="Filtros do cronograma"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Curso
            <select
              value={courseFilter}
              onChange={(event) => {
                setCourseFilter(event.target.value);
                setClassFilter("");
              }}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.nome}>
                  {course.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Turma
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todas as turmas</option>
              {availableClasses.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.nome}>
                  {classGroup.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Instrutor
            <select
              value={instructorFilter}
              onChange={(event) => setInstructorFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os instrutores</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.nome}>
                  {instructor.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Status da aula
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as LessonScheduleStatus | "")
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os status</option>
              <option value="concluida">Concluida</option>
              <option value="proxima">Proxima</option>
              <option value="pendente">Pendente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
        </div>
      </section>

      <section
        aria-label="Indicadores do cronograma"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Aulas concluidas"
          value={completedLessons}
          subtitle="Aulas ja realizadas"
          variant="green"
        />
        <CoordinatorStatCard
          title="Proximas aulas"
          value={upcomingLessons}
          subtitle="Planejadas para os proximos dias"
          variant="blue"
        />
        <CoordinatorStatCard
          title="Aulas pendentes"
          value={pendingLessons}
          subtitle="Planejadas com data vencida"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Aulas canceladas"
          value={canceledLessons}
          subtitle="Retiradas do cronograma"
          variant="neutral"
        />
      </section>

      <ScheduleTable
        lessons={filteredLessons}
        isPending={isPending}
        onEditLesson={editarAula}
        onSetStatus={atualizarStatusAula}
        onRemoveLesson={removerAula}
      />

      {lessonParaRemover && (
        <ConfirmDialog
          title="Remover aula?"
          description={`A aula "${lessonParaRemover.titulo}" será removida do cronograma. Essa ação não pode ser desfeita.`}
          confirmLabel="Remover aula"
          tone="danger"
          isLoading={isPending}
          onCancel={() => setLessonParaRemover(null)}
          onConfirm={() => confirmarRemocaoAula(lessonParaRemover)}
        />
      )}
    </>
  );
};
