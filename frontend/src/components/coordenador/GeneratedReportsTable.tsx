"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  baixarRelatorioGeradoCsvAction,
  baixarRelatorioGeradoPdfAction,
  deletarRelatorioGeradoAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Notificacao } from "@/components/shared/Notificacao";
import type { GeneratedReport } from "@/types/coordinator";
import { downloadBase64File } from "@/utils/downloadFile";

interface GeneratedReportsTableProps {
  reports: GeneratedReport[];
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export const GeneratedReportsTable = ({
  reports,
}: GeneratedReportsTableProps) => {
  const router = useRouter();
  const [reportToDelete, setReportToDelete] = useState<GeneratedReport | null>(
    null,
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const handleDownload = async (
    report: GeneratedReport,
    format: "csv" | "pdf",
  ) => {
    setLoadingId(`${report.id}-${format}`);
    setMessage("");

    const result =
      format === "csv"
        ? await baixarRelatorioGeradoCsvAction(report.id)
        : await baixarRelatorioGeradoPdfAction(report.id);

    setLoadingId(null);

    if (!result.sucesso || !result.arquivo) {
      setMessage(result.mensagem);
      return;
    }

    downloadBase64File(result.arquivo);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);
    setMessage("");
    const result = await deletarRelatorioGeradoAction(reportToDelete.id);
    setIsDeleting(false);

    if (!result.sucesso) {
      setMessage(result.mensagem);
      return;
    }

    setReportToDelete(null);
    router.refresh();
  };

  return (
    <section
      aria-labelledby="generated-reports-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div>
        <h2
          id="generated-reports-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Relatórios gerados
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Arquivos persistidos para download posterior.
        </p>
      </div>

      {message && (
        <Notificacao tipo="erro" className="mt-4">
          {message}
        </Notificacao>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-2xl border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Relatório
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Data de geração
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="border-slate-100 border-b px-3 py-3">
                  <p className="font-semibold text-slate-900">
                    {report.titulo}
                  </p>
                  <p className="mt-1 text-slate-500 text-xs">{report.tipo}</p>
                </td>
                <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                  {formatDateTime(report.criadoEm)}
                </td>
                <td className="border-slate-100 border-b px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(report, "csv")}
                      disabled={loadingId !== null}
                      aria-label={`Baixar CSV de ${report.titulo}`}
                      title="Baixar CSV"
                      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 font-semibold text-slate-700 text-xs transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(report, "pdf")}
                      disabled={loadingId !== null}
                      aria-label={`Baixar PDF de ${report.titulo}`}
                      title="Baixar PDF"
                      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 font-semibold text-slate-700 text-xs transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportToDelete(report)}
                      disabled={loadingId !== null}
                      aria-label={`Excluir ${report.titulo}`}
                      title="Excluir relatório"
                      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-red-200 px-3 font-semibold text-red-700 text-xs transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {reports.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum relatório gerado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {reportToDelete && (
        <ConfirmDialog
          title="Excluir relatório?"
          description="Esta ação removerá o relatório gerado e seus arquivos CSV/PDF. Deseja continuar?"
          confirmLabel="Excluir relatório"
          cancelLabel="Cancelar"
          tone="danger"
          isLoading={isDeleting}
          onCancel={() => setReportToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
};
