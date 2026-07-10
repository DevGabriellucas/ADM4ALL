"use client";

import Link from "next/link";
import { useEffect } from "react";

interface CoordinatorDashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CoordinatorDashboardError({
  error,
  reset,
}: CoordinatorDashboardErrorProps) {
  useEffect(() => {
    console.error("Erro ao carregar o dashboard do coordenador:", error);
  }, [error]);

  return (
    <section className="flex flex-col items-center justify-center rounded-lg border border-[#D5DDEC] bg-white px-6 py-16 text-center shadow-sm">
      <h1 className="font-semibold text-slate-950 text-xl">
        Não foi possível carregar o dashboard
      </h1>
      <p className="mt-3 max-w-md text-slate-600 text-sm leading-relaxed">
        Ocorreu um erro ao buscar os dados do painel. Verifique sua conexão e
        tente novamente.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-x-2 rounded-lg bg-brand-dark px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-[#23275F]"
        >
          Tentar novamente
        </button>
        <Link
          href="/coordenador/dashboard"
          className="inline-flex cursor-pointer items-center gap-x-2 rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-50"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </section>
  );
}
