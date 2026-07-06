"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { clearSession } from "@/services/sessionService";
import type { InstrutorResumo } from "@/types/instrutor";

interface InstrutorSidebarProps {
  instrutor: InstrutorResumo;
}

const NAV_ITENS = [
  { label: "Dashboard", href: "/instrutor/dashboard" },
  { label: "Presenca", href: "/instrutor/presenca" },
  { label: "Frequencia", href: "/instrutor/frequencia" },
  { label: "Cronograma", href: "/instrutor/cronograma" },
  { label: "Materiais", href: "/instrutor/materiais" },
  { label: "Perfil", href: "/instrutor/perfil" },
  { label: "Configuracoes", href: "/instrutor/configuracoes" },
];

const getIniciais = (nome?: string | null) => {
  if (!nome) return "IN";

  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";

  return `${primeira}${ultima || primeira}`.toUpperCase();
};

export const InstrutorSidebar = ({ instrutor }: InstrutorSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const confirmarSaida = () => {
    clearSession();
    router.replace("/");
  };

  return (
    <aside className="flex w-full flex-col gap-y-5 bg-brand-medium px-4 py-5 text-slate-950 sm:px-6 lg:sticky lg:top-0 lg:min-h-screen lg:w-64 lg:shrink-0 lg:gap-y-8 lg:overflow-y-auto lg:px-6 lg:py-8">
      <div className="flex items-center gap-x-4 lg:flex-col lg:gap-y-3 lg:text-center">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-[#E7ECF8] bg-brand-dark font-semibold text-lg text-white shadow-md lg:size-18">
          {getIniciais(instrutor.nome)}
        </span>

        <div className="flex min-w-0 flex-col lg:items-center">
          <span className="font-semibold text-base">Instrutor</span>
          <span className="truncate text-sm lg:whitespace-normal">
            {instrutor.nome}
          </span>
        </div>
      </div>

      <nav
        aria-label="Menu do instrutor"
        className="-mx-2 flex gap-1 overflow-x-auto px-2 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {NAV_ITENS.map((item) => {
          const ativo = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={`min-w-max rounded-md px-3 py-2 text-sm tracking-[0.15em] transition-colors hover:bg-white/20 ${
                ativo ? "bg-white/25 font-semibold" : "font-medium"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setConfirmandoSaida(true)}
          className="flex min-w-max items-center gap-x-2 rounded-md px-3 py-2 text-left font-semibold text-red-700 text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70 lg:mt-2"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5 shrink-0 text-red-700"
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
      </nav>

      {confirmandoSaida && (
        <ConfirmDialog
          title="Deseja sair?"
          description="Voce sera desconectado da area do instrutor."
          confirmLabel="Sair"
          tone="danger"
          onCancel={() => setConfirmandoSaida(false)}
          onConfirm={confirmarSaida}
        />
      )}
    </aside>
  );
};
