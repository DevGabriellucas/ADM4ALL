"use client";

import { useEffect, useRef, useState } from "react";

interface CertificatePreviewModalProps {
  pdfBase64: string;
  pdfFileName?: string;
  pdfContentType?: string;
  onClose: () => void;
}

export const CertificatePreviewModal = ({
  pdfBase64,
  pdfFileName = "certificado.pdf",
  pdfContentType = "application/pdf",
  onClose,
}: CertificatePreviewModalProps) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const binary = atob(pdfBase64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: pdfContentType });
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setBlobUrl(url);

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [pdfBase64, pdfContentType]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = pdfFileName;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-preview-title"
    >
      <div className="flex max-h-[95vh] w-full max-w-[1220px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-slate-200 border-b px-5 py-4">
          <div>
            <h2
              id="certificate-preview-title"
              className="font-semibold text-lg text-slate-950"
            >
              Visualizar certificado
            </h2>
            <p className="text-slate-500 text-xs">
              Visualização do PDF gerado pelo sistema.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-emerald-700"
            >
              Baixar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-3 py-2 font-semibold text-slate-600 text-sm transition-colors hover:bg-slate-100"
            >
              Fechar
            </button>
          </div>
        </header>

        <div className="flex-1 bg-slate-200 p-5">
          {blobUrl ? (
            <iframe
              src={blobUrl}
              className="h-[75vh] w-full rounded-lg border-0 bg-white shadow-inner"
              title="Certificado PDF"
            />
          ) : (
            <div className="flex h-[75vh] items-center justify-center text-slate-500 text-sm">
              Carregando...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
