"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className = "" }: BackButtonProps) => {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Voltar para a pagina anterior"
      className={`inline-flex w-fit cursor-pointer items-center gap-x-1.5 rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 text-xs tracking-[0.2em] transition-colors hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-medium focus-visible:outline-offset-2 ${className}`}
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
        <title>Voltar</title>
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      <span>Voltar</span>
    </button>
  );
};
