"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { coordinatorNavItems } from "@/components/coordenador/coordinatorNavItems";

interface CoordinatorSidebarProps {
  nomeUsuario: string;
  perfilUsuario: string;
}

const getIniciais = (nome?: string) => {
  if (!nome) return "";

  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";

  return `${primeira}${ultima || primeira}`.toUpperCase();
};

const PERFIL_LABEL: Record<string, string> = {
  coordenador: "Coordenador",
  admin: "Admin",
};

export const CoordinatorSidebar = ({
  nomeUsuario,
  perfilUsuario,
}: CoordinatorSidebarProps) => {
  const pathname = usePathname();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const cargo = PERFIL_LABEL[perfilUsuario] ?? "Coordenador";

  const confirmarSaida = () => {
    window.location.replace("/logout");
  };

  const iniciaisUsuario = getIniciais(nomeUsuario);
  const avatarText = iniciaisUsuario || cargo.charAt(0) || "?";

  return (
    <aside className="hidden bg-brand-medium text-slate-950 xl:sticky xl:top-0 xl:flex xl:h-screen xl:w-64 xl:shrink-0 xl:flex-col xl:gap-y-8 xl:overflow-y-auto xl:px-6 xl:py-8">
      <div className="flex items-center gap-x-4 xl:flex-col xl:gap-y-3 xl:text-center">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-[#E7ECF8] bg-brand-dark font-semibold text-lg text-white shadow-md xl:size-18">
          {avatarText}
        </span>

        <div className="flex min-w-0 flex-col xl:items-center">
          <span className="font-semibold text-base">{cargo}</span>
          <span className="truncate text-sm xl:whitespace-normal">
            {nomeUsuario || cargo}
          </span>
        </div>
      </div>

      <nav
        aria-label="Menu do coordenador"
        className="-mx-2 flex gap-1 overflow-x-auto px-2 pb-2 xl:mx-0 xl:flex-col xl:overflow-visible xl:px-0 xl:pb-0"
      >
        {coordinatorNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-max items-center justify-between gap-2 rounded-md px-3 py-2 text-sm tracking-[0.15em] transition-colors hover:bg-white/20 xl:min-w-0 ${
                isActive ? "bg-white/25 font-semibold" : "font-medium"
              }`}
            >
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setConfirmandoSaida(true)}
          className="flex min-w-max cursor-pointer items-center gap-x-2 rounded-md px-3 py-2 text-left font-semibold text-[#8F1D2C] text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70 xl:mt-2"
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
      </nav>

      {confirmandoSaida && (
        <ConfirmDialog
          title="Deseja sair?"
          description="Você será desconectado da área do coordenador."
          confirmLabel="Sair"
          tone="danger"
          onCancel={() => setConfirmandoSaida(false)}
          onConfirm={confirmarSaida}
        />
      )}
    </aside>
  );
};
