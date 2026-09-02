"use client";

import { useState } from "react";
import type { AuthenticatedFileResponse } from "@/services/apiClient";
import { downloadBase64File } from "@/utils/downloadFile";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface BotaoBaixarMaterialProps {
  /**
   * Server Action ja vinculada ao material (use `.bind(null, id)`), que busca o
   * arquivo na API com o token da sessao e devolve o conteudo em base64.
   */
  baixar: () => Promise<AuthenticatedFileResponse>;
  rotulo?: string;
  className?: string;
}

/**
 * Baixa material de turma pela rota autenticada.
 *
 * Antes o link apontava direto para o arquivo estatico do backend, o que
 * deixava qualquer material baixavel por quem tivesse a URL, sem login. Aqui o
 * arquivo e buscado no servidor com o token da sessao — a API confere se o
 * usuario tem vinculo com a turma antes de entregar.
 */
export const BotaoBaixarMaterial = ({
  baixar,
  rotulo = "Abrir material",
  className = "",
}: BotaoBaixarMaterialProps) => {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleClick = async () => {
    setBaixando(true);
    setErro(null);

    try {
      downloadBase64File(await baixar());
    } catch (error) {
      setErro(getErrorMessage(error));
    } finally {
      setBaixando(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={baixando}
        className={
          className ||
          "inline-flex h-9 w-fit cursor-pointer items-center rounded-md bg-brand-dark px-3 font-semibold text-sm text-white transition-colors hover:bg-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {baixando ? "Abrindo…" : rotulo}
      </button>

      {erro && (
        <p role="alert" className="text-red-700 text-xs">
          {erro}
        </p>
      )}
    </div>
  );
};
