"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { InstrutorResumo } from "@/types/instrutor";

interface InstrutorSidebarProps {
  instrutor: InstrutorResumo;
}

export const instrutorNavItems = [
  { label: "Dashboard", href: "/instrutor/dashboard" },
  { label: "Presença", href: "/instrutor/presenca" },
  { label: "Frequência", href: "/instrutor/frequencia" },
  { label: "Cronograma", href: "/instrutor/cronograma" },
  { label: "Materiais", href: "/instrutor/materiais" },
  { label: "Perfil", href: "/instrutor/perfil" },
];

const getIniciais = (nome?: string | null) => {
  if (!nome) return "IN";

  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";

  return `${primeira}${ultima || primeira}`.toUpperCase();
};

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

const resolverAvatarUrl = (url: string | null) => {
  if (!url) return null;
  return url.startsWith("/") ? `${API_URL}${url}` : url;
};

export const InstrutorSidebar = ({ instrutor }: InstrutorSidebarProps) => {
  const pathname = usePathname();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const avatarUrl = resolverAvatarUrl(instrutor.avatarUrl);

  const confirmarSaida = () => {
    window.location.replace("/logout");
  };

  return (
    <aside className="hidden bg-brand-medium px-4 py-5 text-slate-950 xl:sticky xl:top-0 xl:flex xl:h-screen xl:w-64 xl:shrink-0 xl:flex-col xl:gap-y-8 xl:overflow-y-auto xl:px-6 xl:py-8">
      <div className="flex items-center gap-x-4 xl:flex-col xl:gap-y-3 xl:text-center">
        <span
          className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#E7ECF8] bg-brand-dark bg-center bg-cover font-semibold text-lg text-white shadow-md xl:size-18"
          style={
            avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined
          }
        >
          {!avatarUrl && getIniciais(instrutor.nome)}
        </span>

        <div className="flex min-w-0 flex-col xl:items-center">
          <span className="font-semibold text-base">Instrutor</span>
          <span className="truncate text-sm xl:whitespace-normal">
            {instrutor.nome}
          </span>
        </div>
      </div>

      <nav
        aria-label="Menu do instrutor"
        className="-mx-2 flex gap-1 overflow-x-auto px-2 pb-2 xl:mx-0 xl:flex-col xl:overflow-visible xl:px-0 xl:pb-0"
      >
        {instrutorNavItems.map((item) => {
          const ativo =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

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
          className="flex min-w-max cursor-pointer items-center gap-x-2 rounded-md px-3 py-2 text-left font-semibold text-red-700 text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70 xl:mt-2"
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
          description="Você será desconectado da área do instrutor."
          confirmLabel="Sair"
          tone="danger"
          onCancel={() => setConfirmandoSaida(false)}
          onConfirm={confirmarSaida}
        />
      )}
    </aside>
  );
};
