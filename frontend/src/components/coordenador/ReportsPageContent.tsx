"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { GeneratedReportsTable } from "@/components/coordenador/GeneratedReportsTable";
import { ReportPreviewPanel } from "@/components/coordenador/ReportPreviewPanel";
import type {
  ClassGroup,
  CoordinatorReportData,
  CoordinatorReportType,
  Course,
  GeneratedReport,
} from "@/types/coordinator";

interface ReportsPageContentProps {
  reports: CoordinatorReportData[];
  courses: Course[];
  classes: ClassGroup[];
  generatedReports: GeneratedReport[];
}

export const ReportsPageContent = ({
  reports,
  courses,
  classes,
  generatedReports,
}: ReportsPageContentProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] =
    useState<CoordinatorReportType>("frequencia_turma");
  const [courseFilter, setCourseFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const selectedReport =
    reports.find((report) => report.type === reportType) ?? reports[0];

  // A API pode devolver a lista vazia; sem esta guarda o acesso a
  // selectedReport.rows quebrava a pagina inteira no error boundary.
  if (!selectedReport) {
    return (
      <>
        <CoordinatorPageHeader
          title="Relatórios"
          subtitle="Gere relatórios acadêmicos e administrativos"
        />
        <p className="rounded-lg border border-[#D5DDEC] bg-white px-4 py-8 text-center text-slate-500 text-sm shadow-sm">
          Nenhum relatório disponível no momento.
        </p>
      </>
    );
  }

  const availableClasses = classes.filter(
    (classGroup) => !courseFilter || classGroup.curso === courseFilter,
  );
  const filteredRows = selectedReport.rows.filter((row) => {
    if (startDate && row.data < startDate) {
      return false;
    }
    if (endDate && row.data > endDate) {
      return false;
    }
    if (courseFilter && row.curso !== courseFilter) {
      return false;
    }
    if (classFilter && row.turma !== classFilter) {
      return false;
    }

    return true;
  });

  return (
    <>
      <CoordinatorPageHeader
        title="Relatórios"
        subtitle="Gere relatórios acadêmicos e administrativos"
      />

      <section
        aria-label="Filtros de relatórios"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Data inicial
            <input
              type="date"
              max={endDate || undefined}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Data final
            <input
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Tipo de relatório
            <select
              value={reportType}
              onChange={(event) => {
                setReportType(event.target.value as CoordinatorReportType);
                setCourseFilter("");
                setClassFilter("");
              }}
              className="h-10 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none transition-colors hover:border-brand-medium focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              {reports.map((report) => (
                <option key={report.type} value={report.type}>
                  {report.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Curso
            <select
              value={courseFilter}
              onChange={(event) => {
                setCourseFilter(event.target.value);
                setClassFilter("");
              }}
              className="h-10 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none transition-colors hover:border-brand-medium focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
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
              className="h-10 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none transition-colors hover:border-brand-medium focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todas as turmas</option>
              {availableClasses.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.nome}>
                  {classGroup.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <ReportPreviewPanel
        report={selectedReport}
        rows={filteredRows}
        filters={{
          dataInicio: startDate,
          dataFim: endDate,
          curso: courseFilter,
          turma: classFilter,
        }}
      />

      <GeneratedReportsTable reports={generatedReports} />
    </>
  );
};
