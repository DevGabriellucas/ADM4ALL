"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  exportarRelatorioAction,
  gerarRelatorioGeradoAction,
} from "@/app/coordenador/actions";
import type {
  CoordinatorReportData,
  CoordinatorReportFilters,
  ReportDataRow,
} from "@/types/coordinator";

interface ReportPreviewPanelProps {
  report: CoordinatorReportData;
  rows: ReportDataRow[];
  filters: CoordinatorReportFilters;
}

const BAR_COLORS = [
  "bg-brand-dark",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-500",
] as const;

const getMetricValue = (
  report: CoordinatorReportData,
  rows: ReportDataRow[],
  filters: CoordinatorReportFilters,
) => {
  if (report.type === "frequencia_turma") {
    const numerator = rows.reduce(
      (total, row) => total + (row.metricNumerator ?? 0),
      0,
    );
    const denominator = rows.reduce(
      (total, row) => total + (row.metricDenominator ?? 0),
      0,
    );
    if (denominator > 0) {
      return Math.round((numerator / denominator) * 100);
    }
  }

  const hasFilters = Object.values(filters).some(Boolean);
  if (!hasFilters && report.metricValue !== undefined) {
    return report.metricValue;
  }

  if (report.aggregation === "count") {
    return rows.length;
  }

  const total = rows.reduce((sum, row) => sum + row.chartValue, 0);

  if (report.aggregation === "average") {
    return rows.length > 0 ? Math.round(total / rows.length) : 0;
  }

  return total;
};

export const ReportPreviewPanel = ({
  report,
  rows,
  filters,
}: ReportPreviewPanelProps) => {
  const router = useRouter();
  const [loadingFormat, setLoadingFormat] = useState<"pdf" | "csv" | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportError, setExportError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const metricValue = getMetricValue(report, rows, filters);
  const maxChartValue = Math.max(...rows.map((row) => row.chartValue), 1);

  const handleExport = async (format: "pdf" | "csv") => {
    setLoadingFormat(format);
    setExportError("");
    setSuccessMessage("");
    const result = await exportarRelatorioAction(report.type, format, filters);
    setLoadingFormat(null);

    if (!result.sucesso || !result.arquivo) {
      setExportError(result.mensagem);
      return;
    }

    const binary = atob(result.arquivo.base64);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    const url = URL.createObjectURL(
      new Blob([bytes], { type: result.arquivo.contentType }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = result.arquivo.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setExportError("");
    setSuccessMessage("");

    const result = await gerarRelatorioGeradoAction(report.type, filters);
    setIsGenerating(false);

    if (!result.sucesso || !result.relatorio) {
      setExportError(result.mensagem);
      return;
    }

    setSuccessMessage(result.mensagem);
    router.refresh();
  };

  return (
    <>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(16rem,0.65fr)_minmax(0,2fr)]">
        <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <p className="font-semibold text-brand-dark text-xs uppercase tracking-[0.18em]">
            Resumo
          </p>
          <h2 className="mt-3 font-semibold text-lg text-slate-950">
            {report.title}
          </h2>
          <p className="mt-2 text-slate-600 text-sm leading-6">
            {report.description}
          </p>

          <div className="mt-6 border-slate-200 border-t pt-5">
            <p className="text-slate-500 text-xs">{report.metricLabel}</p>
            <p className="mt-1 font-semibold text-4xl text-slate-950">
              {metricValue}
              {report.metricSuffix}
            </p>
            <p className="mt-2 text-slate-500 text-xs">
              {rows.length} registros na prévia
            </p>
          </div>
        </article>

        <section
          aria-labelledby="report-chart-heading"
          className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
        >
          <h2
            id="report-chart-heading"
            className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
          >
            Visão gráfica
          </h2>

          <div className="mt-5 flex min-h-56 flex-col justify-center gap-y-4">
            {rows.slice(0, 8).map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(8rem,2fr)_3rem] items-center gap-3"
              >
                <span className="truncate text-slate-600 text-xs">
                  {row.chartLabel}
                </span>
                <div className="h-7 overflow-hidden rounded bg-slate-100">
                  <div
                    className={`h-full rounded ${BAR_COLORS[index % BAR_COLORS.length]}`}
                    style={{
                      width: `${Math.max(
                        (row.chartValue / maxChartValue) * 100,
                        3,
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-right font-semibold text-slate-800 text-xs">
                  {row.chartValue}
                  {report.metricSuffix}
                </span>
              </div>
            ))}

            {rows.length === 0 && (
              <p className="text-center text-slate-500 text-sm">
                Nenhum dado disponível para os filtros selecionados.
              </p>
            )}
          </div>
        </section>
      </section>

      <section
        aria-labelledby="report-preview-heading"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="report-preview-heading"
              className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
            >
              Prévia dos dados
            </h2>
            <p className="mt-1 text-slate-500 text-xs">
              Confira os registros antes de exportar.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loadingFormat !== null || isGenerating}
              className="h-10 cursor-pointer rounded-lg bg-brand-dark px-4 font-semibold text-white text-xs transition-colors hover:bg-[#292E68] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Gerando..." : "Gerar relatório"}
            </button>
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={loadingFormat !== null || isGenerating}
              className="h-10 cursor-pointer rounded-lg border border-brand-dark bg-white px-4 font-semibold text-brand-dark text-xs transition-colors hover:bg-[#E7ECF8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingFormat === "pdf" ? "Gerando PDF..." : "Gerar PDF"}
            </button>
            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={loadingFormat !== null || isGenerating}
              className="h-10 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-700 text-xs transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingFormat === "csv" ? "Exportando..." : "Exportar"}
            </button>
          </div>
        </div>

        {exportError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-red-700 text-sm">
            {exportError}
          </p>
        )}
        {successMessage && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 text-sm">
            {successMessage}
          </p>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-2xl border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                {report.columns.map((column) => (
                  <th
                    key={column.key}
                    className="border-slate-200 border-b px-3 py-2 font-semibold"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {report.columns.map((column) => (
                    <td
                      key={column.key}
                      className="border-slate-100 border-b px-3 py-3 text-slate-700"
                    >
                      {row.values[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={report.columns.length}
                    className="px-3 py-8 text-center text-slate-500 text-sm"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};
