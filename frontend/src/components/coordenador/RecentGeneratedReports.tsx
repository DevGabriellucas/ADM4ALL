"use client";

import { useState } from "react";
import {
  baixarRelatorioGeradoCsvAction,
  baixarRelatorioGeradoPdfAction,
} from "@/app/coordenador/actions";
import { Notificacao } from "@/components/shared/Notificacao";
import type { GeneratedReport } from "@/types/coordinator";

interface RecentGeneratedReportsProps {
  reports: GeneratedReport[];
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const downloadBase64File = (file: {
  base64: string;
  contentType: string;
  fileName: string;
}) => {
  const binary = atob(file.base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(
    new Blob([bytes], { type: file.contentType }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const RecentGeneratedReports = ({
  reports,
}: RecentGeneratedReportsProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDownload = async (
    report: GeneratedReport,
    format: "csv" | "pdf",
  ) => {
    setLoadingId(`${report.id}-${format}`);
    setErrorMessage("");

    const result =
      format === "csv"
        ? await baixarRelatorioGeradoCsvAction(report.id)
        : await baixarRelatorioGeradoPdfAction(report.id);

    setLoadingId(null);

    if (!result.sucesso || !result.arquivo) {
      setErrorMessage(result.mensagem);
      return;
    }

    downloadBase64File(result.arquivo);
  };

  return (
    <div className="mt-4 flex flex-col gap-y-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                {report.titulo}
              </p>
              <p className="mt-1 text-slate-500 text-xs leading-5">
                Gerado em {formatDateTime(report.criadoEm)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDownload(report, "csv")}
                disabled={loadingId !== null}
                className="h-8 cursor-pointer rounded-lg border border-slate-300 px-3 font-semibold text-slate-700 text-xs transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => handleDownload(report, "pdf")}
                disabled={loadingId !== null}
                className="h-8 cursor-pointer rounded-lg border border-slate-300 px-3 font-semibold text-slate-700 text-xs transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      ))}

      {errorMessage && <Notificacao tipo="erro">{errorMessage}</Notificacao>}
    </div>
  );
};
