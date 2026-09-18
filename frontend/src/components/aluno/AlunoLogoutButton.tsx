"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const AlunoLogoutButton = () => {
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const confirmarSaida = () => {
    window.location.replace("/logout");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmandoSaida(true)}
        aria-label="Sair da conta"
        className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-3 py-2.5 text-left font-semibold text-sm text-white tracking-[0.15em] transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <title>Sair</title>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        <span>Sair</span>
      </button>

      {confirmandoSaida && (
        <ConfirmDialog
          title="Deseja sair?"
          description="Você será desconectado da área do aluno."
          confirmLabel="Sair"
          tone="danger"
          onCancel={() => setConfirmandoSaida(false)}
          onConfirm={confirmarSaida}
        />
      )}
    </>
  );
};
