"use client";

import { useState } from "react";
import { emitirCertificadoAlunoAction } from "@/app/coordenador/actions";
import type { CertificateDetail, CertificateRecord } from "@/types/coordinator";

interface CertificateIssueModalProps {
  certificate: CertificateRecord;
  onClose: () => void;
  onSuccess: (message: string, detail: CertificateDetail) => void;
}

export const CertificateIssueModal = ({
  certificate,
  onClose,
  onSuccess,
}: CertificateIssueModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleIssue = async () => {
    setLoading(true);
    setError("");
    const result = await emitirCertificadoAlunoAction(certificate.referenciaId);
    setLoading(false);

    if (!result.sucesso || !result.certificado) {
      setError(result.mensagem);
      return;
    }

    onSuccess(result.mensagem, result.certificado);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-issue-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <h2
          id="certificate-issue-title"
          className="font-semibold text-lg text-slate-950"
        >
          Emitir certificado?
        </h2>
        <p className="mt-2 text-slate-600 text-sm">
          Será emitido um certificado de conclusão de curso para{" "}
          <strong>{certificate.nome}</strong>.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-red-700 text-sm">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleIssue}
            disabled={loading}
            className="rounded-lg bg-brand-dark px-4 py-2 font-semibold text-sm text-white hover:bg-[#23275F] disabled:opacity-60"
          >
            {loading ? "Emitindo..." : "Emitir certificado"}
          </button>
        </div>
      </div>
    </div>
  );
};
