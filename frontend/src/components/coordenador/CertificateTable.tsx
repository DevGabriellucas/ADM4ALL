"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  baixarCertificadoPdfAction,
  visualizarCertificadoPdfAction,
} from "@/app/coordenador/actions";
import { CertificateCancelModal } from "@/components/coordenador/CertificateCancelModal";
import { CertificateIssueModal } from "@/components/coordenador/CertificateIssueModal";
import { CertificatePreviewModal } from "@/components/coordenador/CertificatePreviewModal";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type {
  CertificateDetail,
  CertificateDisplayStatus,
  CertificateRecord,
} from "@/types/coordinator";
import { getCertificateStatus } from "@/utils/getCertificateStatus";

interface CertificateTableProps {
  certificates: CertificateRecord[];
}

interface PdfPreviewData {
  base64: string;
  contentType: string;
  fileName: string;
}

const getStatusInfo = (status: CertificateDisplayStatus) => {
  if (status === "elegivel")
    return { label: "Elegível", tone: "blue" as const };
  if (status === "pendente")
    return { label: "Pendente", tone: "amber" as const };
  if (status === "emitido") return { label: "Emitido", tone: "green" as const };
  if (status === "cancelado")
    return { label: "Cancelado", tone: "red" as const };
  return { label: "Não elegível", tone: "red" as const };
};

const getCertificateLabel = (
  certificate: CertificateRecord,
  status: CertificateDisplayStatus,
) => {
  if (certificate.certificado) return certificate.certificado;
  if (status === "nao_elegivel") return "Indisponível";
  if (status === "cancelado") return "Cancelado";
  return "Aguardando emissão";
};

export const CertificateTable = ({ certificates }: CertificateTableProps) => {
  const router = useRouter();
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewData | null>(null);
  const [issueTarget, setIssueTarget] = useState<CertificateRecord | null>(
    null,
  );
  const [cancelTarget, setCancelTarget] = useState<CertificateRecord | null>(
    null,
  );
  const [loadingReference, setLoadingReference] = useState<string | null>(null);
  const [downloadingReference, setDownloadingReference] = useState<
    string | null
  >(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const openPreview = async (certificate: CertificateRecord) => {
    if (certificate.status !== "emitido") {
      setFeedback({
        type: "error",
        message: "O certificado ainda não foi emitido.",
      });
      return;
    }
    setLoadingReference(certificate.referenciaId);
    setFeedback(null);
    const result = await visualizarCertificadoPdfAction(
      certificate.referenciaId,
    );
    setLoadingReference(null);
    if (!result.sucesso || !result.arquivo) {
      setFeedback({ type: "error", message: result.mensagem });
      return;
    }
    setPdfPreview({
      base64: result.arquivo.base64,
      contentType: result.arquivo.contentType,
      fileName: result.arquivo.fileName,
    });
  };

  const baixarPdf = async (certificate: CertificateRecord) => {
    if (certificate.status !== "emitido") return;
    setDownloadingReference(certificate.referenciaId);
    setFeedback(null);
    const result = await baixarCertificadoPdfAction(certificate.referenciaId);
    setDownloadingReference(null);
    if (!result.sucesso || !result.arquivo) {
      setFeedback({ type: "error", message: result.mensagem });
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

  const handleIssueSuccess = async (
    message: string,
    _detail: CertificateDetail,
  ) => {
    setIssueTarget(null);
    setFeedback({ type: "success", message });
    router.refresh();
  };

  const handleCancelSuccess = (message: string) => {
    setCancelTarget(null);
    setFeedback({ type: "success", message });
    router.refresh();
  };

  return (
    <>
      <section
        aria-labelledby="certificates-table-heading"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="mb-4">
          <h2
            id="certificates-table-heading"
            className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
          >
            Certificados
          </h2>
          <p className="mt-1 text-slate-500 text-xs">
            Conclusão de alunos nos cursos do projeto.
          </p>
        </div>
        {feedback && (
          <p
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${feedback.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
          >
            {feedback.message}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-6xl border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Aluno
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Curso
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Turma
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Frequência
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Status
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Código
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((certificate) => {
                const certificateStatus = getCertificateStatus(certificate);
                const status = getStatusInfo(certificateStatus);
                const isLoading = loadingReference === certificate.referenciaId;
                const isDownloading =
                  downloadingReference === certificate.referenciaId;
                return (
                  <tr key={certificate.referenciaId}>
                    <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                      {certificate.nome}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {certificate.curso}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {certificate.turma ?? "Projeto de extensão"}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 font-semibold text-slate-800">
                      {certificate.frequencia}%
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3">
                      <CoordinatorStatusBadge
                        label={status.label}
                        tone={status.tone}
                      />
                      {certificateStatus === "nao_elegivel" &&
                        certificate.motivoInelegibilidade && (
                          <p className="mt-1 max-w-52 text-red-700 text-xs">
                            {certificate.motivoInelegibilidade}
                          </p>
                        )}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-600 text-xs">
                      {getCertificateLabel(certificate, certificateStatus)}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3">
                      <div className="flex min-w-max flex-wrap gap-x-3 gap-y-2">
                        {certificateStatus === "elegivel" && (
                          <button
                            type="button"
                            onClick={() => setIssueTarget(certificate)}
                            className="font-semibold text-blue-700 text-xs transition-colors hover:text-blue-900"
                          >
                            Emitir
                          </button>
                        )}
                        {certificateStatus === "emitido" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openPreview(certificate)}
                              disabled={isLoading}
                              className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F] disabled:opacity-60"
                            >
                              {isLoading ? "Carregando..." : "Visualizar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => baixarPdf(certificate)}
                              disabled={isDownloading}
                              className="font-semibold text-emerald-700 text-xs transition-colors hover:text-emerald-900 disabled:opacity-60"
                            >
                              {isDownloading ? "Baixando..." : "Baixar PDF"}
                            </button>
                          </>
                        )}
                        {(certificateStatus === "emitido" ||
                          certificateStatus === "pendente") &&
                          certificate.certificadoId && (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(certificate)}
                              className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                            >
                              Cancelar
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {certificates.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-slate-500 text-sm"
                  >
                    Nenhum certificado encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {issueTarget && (
        <CertificateIssueModal
          certificate={issueTarget}
          onClose={() => setIssueTarget(null)}
          onSuccess={handleIssueSuccess}
        />
      )}
      {cancelTarget && (
        <CertificateCancelModal
          certificate={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={handleCancelSuccess}
        />
      )}
      {pdfPreview && (
        <CertificatePreviewModal
          pdfBase64={pdfPreview.base64}
          pdfFileName={pdfPreview.fileName}
          pdfContentType={pdfPreview.contentType}
          onClose={() => setPdfPreview(null)}
        />
      )}
    </>
  );
};
