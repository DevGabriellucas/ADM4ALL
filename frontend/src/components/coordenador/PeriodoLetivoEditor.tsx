"use client";

import { useState } from "react";
import { atualizarPeriodoLetivoAction } from "@/app/coordenador/actions";

const PERIODO_REGEX = /^\d{4}\.[12]$/;

interface PeriodoLetivoEditorProps {
  periodoInicial: string;
}

export const PeriodoLetivoEditor = ({
  periodoInicial,
}: PeriodoLetivoEditorProps) => {
  const [periodo, setPeriodo] = useState(periodoInicial);
  const [editando, setEditando] = useState(false);
  const [valorEditado, setValorEditado] = useState(periodoInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const abrirEdicao = () => {
    setValorEditado(periodo);
    setErro(null);
    setEditando(true);
  };

  const cancelar = () => {
    setEditando(false);
    setErro(null);
  };

  const salvar = async () => {
    const valorLimpo = valorEditado.trim();

    if (!PERIODO_REGEX.test(valorLimpo)) {
      setErro("Use o formato AAAA.P, por exemplo 2026.1 ou 2026.2.");
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const data = await atualizarPeriodoLetivoAction(valorLimpo);
      setPeriodo(data.periodoLetivo);
      setEditando(false);
    } catch (err: unknown) {
      setErro(
        err instanceof Error
          ? err.message
          : "Falha ao salvar o periodo letivo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-y-1">
      <p className="font-semibold text-xs uppercase tracking-[0.35em]">
        Período letivo
      </p>

      <div className="flex items-center gap-x-2">
        <p className="font-semibold text-sm sm:text-base">{periodo}</p>
        <button
          type="button"
          onClick={abrirEdicao}
          aria-label="Editar período letivo"
          className="inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          >
            <title>Editar período letivo</title>
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="M15 5l4 4" />
          </svg>
        </button>
      </div>

      {editando && (
        <div className="mt-1 flex flex-col items-center gap-y-2">
          <div className="flex items-center gap-x-2">
            <input
              type="text"
              value={valorEditado}
              onChange={(e) => {
                setValorEditado(e.target.value);
                setErro(null);
              }}
              disabled={loading}
              placeholder="AAAA.P"
              maxLength={6}
              className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-center text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={salvar}
              disabled={loading}
              className="cursor-pointer rounded-md bg-brand-dark px-2.5 py-1 text-white text-xs transition-colors hover:bg-[#23275F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={cancelar}
              disabled={loading}
              className="cursor-pointer rounded-md border border-slate-300 px-2.5 py-1 text-slate-600 text-xs transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
          {erro && <p className="text-red-700 text-xs">{erro}</p>}
        </div>
      )}
    </div>
  );
};
