"use client";

import { useState } from "react";
import { baixarCertificadoAlunoAction } from "@/app/aluno/actions";
import { downloadBase64File } from "@/utils/downloadFile";

interface AlunoCompletionMessageProps {
  curso: string;
  certificadoDisponivel: boolean;
  mostrarMensagem?: boolean;
}

export const AlunoCompletionMessage = ({
  curso,
  certificadoDisponivel,
  mostrarMensagem = true,
}: AlunoCompletionMessageProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await baixarCertificadoAlunoAction();
      downloadBase64File(result);
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

  // O cartao e a tipografia vem do <Notificacao> que envolve esta mensagem no
  // painel do aluno; aqui fica so o conteudo.
  return (
    <>
      {mostrarMensagem && (
        <p>Parabéns! Você concluiu o curso {curso} com sucesso.</p>
      )}

      {/* Concluir o curso com a frequencia necessaria ja libera o certificado,
          mas quem emite o arquivo e a coordenacao. Dizer apenas "nao esta
          disponivel" fazia o aluno achar que tinha ficado de fora. */}
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
          {error && <p className="mt-2 text-red-700">{error}</p>}
        </>
      ) : mostrarMensagem ? (
        <p className="mt-3">
          Seu certificado foi liberado e será emitido pela coordenação. O
          download aparece aqui assim que estiver pronto.
        </p>
      ) : null}
    </>
  );
};
