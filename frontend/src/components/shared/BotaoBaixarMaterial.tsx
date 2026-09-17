"use client";

import { useState } from "react";
import { Notificacao } from "@/components/shared/Notificacao";
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
  modo?: "baixar" | "abrir";
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
  rotulo,
  className = "",
  modo = "baixar",
}: BotaoBaixarMaterialProps) => {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleClick = async () => {
    setBaixando(true);
    setErro(null);

    try {
      const arquivo = await baixar();

      if (modo === "abrir") {
        const binary = atob(arquivo.base64);
        const bytes = Uint8Array.from(binary, (character) =>
          character.charCodeAt(0),
        );
        const url = URL.createObjectURL(
          new Blob([bytes], { type: arquivo.contentType }),
        );
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        downloadBase64File(arquivo);
      }
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
        {baixando
          ? "Abrindo…"
          : (rotulo ??
            (modo === "abrir" ? "Abrir material" : "Baixar material"))}
      </button>

      {erro && <Notificacao tipo="erro">{erro}</Notificacao>}
    </div>
  );
};
