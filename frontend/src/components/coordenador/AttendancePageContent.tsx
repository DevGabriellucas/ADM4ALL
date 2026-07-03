"use client";

import { useState } from "react";
import { AttendanceTable } from "@/components/coordenador/AttendanceTable";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { MATRICULA_STATUS } from "@/constants/matriculaStatus";
import type {
  AttendanceSituation,
  AttendanceSummary,
  ClassGroup,
  Course,
  Student,
} from "@/types/coordinator";
import { getAttendanceSituation } from "@/utils/getAttendanceSituation";

interface AttendancePageContentProps {
  attendance: AttendanceSummary[];
  courses: Course[];
  classes: ClassGroup[];
  students: Student[];
}

const getAcademicPeriod = (date: string) => {
  const [year, month] = date.split("-").map(Number);
  return `${year}.${month <= 6 ? "1" : "2"}`;
};

export const AttendancePageContent = ({
  attendance,
  courses,
  classes,
  students,
}: AttendancePageContentProps) => {
  const [courseFilter, setCourseFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [situationFilter, setSituationFilter] = useState<
    AttendanceSituation | ""
  >("");

  const availableClasses = classes.filter(
    (classGroup) => !courseFilter || classGroup.curso === courseFilter,
  );
  const periods = Array.from(
    new Set(
      classes.map((classGroup) => getAcademicPeriod(classGroup.dataInicio)),
    ),
  ).sort();
  const attendanceStudentNames = new Set(
    attendance.map((record) => record.aluno),
  );
  const availableStudents = students
    .filter((student) => attendanceStudentNames.has(student.nome))
    .sort((firstStudent, secondStudent) =>
      firstStudent.nome.localeCompare(secondStudent.nome, "pt-BR"),
    );

  const filteredAttendance = attendance.filter((record) => {
    const classGroup = classes.find(
      (currentClass) => currentClass.nome === record.turma,
    );
    const situation = getAttendanceSituation(record);

    if (courseFilter && classGroup?.curso !== courseFilter) {
      return false;
    }
    if (classFilter && record.turma !== classFilter) {
      return false;
    }
    if (studentFilter && record.aluno !== studentFilter) {
      return false;
    }
    if (
      periodFilter &&
      (!classGroup || getAcademicPeriod(classGroup.dataInicio) !== periodFilter)
    ) {
      return false;
    }
    if (situationFilter && situation !== situationFilter) {
      return false;
    }

    return true;
  });

  const averageAttendance =
    filteredAttendance.length > 0
      ? Math.round(
          filteredAttendance.reduce(
            (total, record) => total + record.frequencia,
            0,
          ) / filteredAttendance.length,
        )
      : 0;
  const regularStudents = filteredAttendance.filter(
    (record) => getAttendanceSituation(record) === "regular",
  ).length;
  const attentionStudents = filteredAttendance.filter(
    (record) => getAttendanceSituation(record) === "atencao",
  ).length;
  const studentsBelowEighty = filteredAttendance.filter(
    (record) => record.frequencia < 80,
  ).length;

  const clearFilters = () => {
    setCourseFilter("");
    setClassFilter("");
    setStudentFilter("");
    setPeriodFilter("");
    setSituationFilter("");
  };

  return (
    <>
      <CoordinatorPageHeader
        title="Frequência"
        subtitle="Acompanhe presença, faltas e alunos em risco"
      />

      <section
        aria-label="Filtros de frequência"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
            Aluno
            <select
              value={studentFilter}
              onChange={(event) => setStudentFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os alunos</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.nome}>
                  {student.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Período
            <select
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os períodos</option>
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Situação
            <select
              value={situationFilter}
              onChange={(event) =>
                setSituationFilter(
                  event.target.value as AttendanceSituation | "",
                )
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todas as situações</option>
              <option value="regular">Regular</option>
              <option value="atencao">Atenção</option>
              <option value="risco_reprovacao">Risco de reprovação</option>
              <option value={MATRICULA_STATUS.REPROVADO_FALTA}>
                Reprovado por falta
              </option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
          >
            Limpar filtros
          </button>
        </div>
      </section>

      <section
        aria-label="Indicadores de frequência"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Frequência média"
          value={`${averageAttendance}%`}
          subtitle="Média dos resultados filtrados"
          variant="blue"
        />
        <CoordinatorStatCard
          title="Alunos regulares"
          value={regularStudents}
          subtitle="Com frequência igual ou superior a 80%"
          variant="green"
        />
        <CoordinatorStatCard
          title="Alunos em atenção"
          value={attentionStudents}
          subtitle="Frequência entre 75% e 79%"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Alunos abaixo de 80%"
          value={studentsBelowEighty}
          subtitle="Demandam acompanhamento"
          variant="amber"
        />
      </section>

      <AttendanceTable attendance={filteredAttendance} />
    </>
  );
};
