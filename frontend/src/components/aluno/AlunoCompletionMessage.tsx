"use client";

import { useState } from "react";
import { baixarCertificadoAlunoAction } from "@/app/aluno/actions";

interface AlunoCompletionMessageProps {
  curso: string;
  certificadoDisponivel: boolean;
}

export const AlunoCompletionMessage = ({
  curso,
  certificadoDisponivel,
}: AlunoCompletionMessageProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await baixarCertificadoAlunoAction();
      const binary = atob(result.base64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(
        new Blob([bytes], { type: result.contentType }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel baixar o certificado. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="mx-auto max-w-3xl text-center font-medium text-xs leading-6 tracking-[0.25em]"
      role="status"
    >
      <p>Parabens! Voce concluiu o curso {curso} com sucesso.</p>

      {certificadoDisponivel ? (
        <>
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className="mt-3 inline-block cursor-pointer font-semibold text-brand-dark underline transition-colors hover:text-[#23275F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Baixando..." : "Acessar certificado"}
          </button>
          {error && (
            <p className="mt-2 text-red-600">{error}</p>
          )}
        </>
      ) : (
        <p className="mt-3">Seu certificado ainda nao esta disponivel.</p>
      )}
    </section>
  );
};
