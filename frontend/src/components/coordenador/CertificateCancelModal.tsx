"use client";

import { useState } from "react";
import { cancelarCertificadoAction } from "@/app/coordenador/actions";
import type { CertificateRecord } from "@/types/coordinator";

interface CertificateCancelModalProps {
  certificate: CertificateRecord;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const CertificateCancelModal = ({
  certificate,
  onClose,
  onSuccess,
}: CertificateCancelModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (!certificate.certificadoId) return;

    setLoading(true);
    setError("");
    const result = await cancelarCertificadoAction(certificate.certificadoId);
    setLoading(false);

    if (!result.sucesso) {
      setError(result.mensagem);
      return;
    }

    onSuccess(result.mensagem);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-cancel-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2
          id="certificate-cancel-title"
          className="font-semibold text-lg text-slate-950"
        >
          Cancelar certificado?
        </h2>
        <p className="mt-2 text-slate-600 text-sm">
          O certificado <strong>{certificate.certificado}</strong> de{" "}
          <strong>{certificate.nome}</strong> será marcado como cancelado.
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
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="cursor-pointer rounded-lg bg-red-700 px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Cancelando..." : "Cancelar certificado"}
          </button>
        </div>
      </div>
    </div>
  );
};
