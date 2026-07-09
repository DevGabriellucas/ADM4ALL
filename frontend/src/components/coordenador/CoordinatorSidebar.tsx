"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { clearSession } from "@/services/sessionService";

interface NavItem {
  label: string;
  href: string;
  development?: boolean;
}

interface CoordinatorSidebarProps {
  nomeUsuario: string;
  perfilUsuario: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/coordenador/dashboard" },
  { label: "Cursos", href: "/coordenador/cursos" },
  { label: "Turmas", href: "/coordenador/turmas" },
  { label: "Alunos", href: "/coordenador/alunos" },
  { label: "Instrutores", href: "/coordenador/instrutores" },
  { label: "Certificados", href: "/coordenador/certificados" },
  { label: "Relatórios", href: "/coordenador/relatorios" },
  { label: "Usuários", href: "/coordenador/usuarios" },
  {
    label: "Configurações",
    href: "/coordenador/configuracoes",
    development: true,
  },
];

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
  const router = useRouter();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const cargo = PERFIL_LABEL[perfilUsuario] ?? "Coordenador";

  const confirmarSaida = () => {
    clearSession();
    router.replace("/");
  };

  const iniciaisUsuario = getIniciais(nomeUsuario);
  const avatarText = iniciaisUsuario || cargo.charAt(0) || "?";

  return (
    <aside className="flex w-full flex-col gap-y-5 bg-brand-medium px-4 py-5 text-slate-950 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:gap-y-8 lg:overflow-y-auto lg:px-6 lg:py-8">
      <div className="flex items-center gap-x-4 lg:flex-col lg:gap-y-3 lg:text-center">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-[#E7ECF8] bg-brand-dark font-semibold text-lg text-white shadow-md lg:size-18">
          {avatarText}
        </span>

        <div className="flex min-w-0 flex-col lg:items-center">
          <span className="font-semibold text-base">{cargo}</span>
          <span className="truncate text-sm lg:whitespace-normal">
            {nomeUsuario || cargo}
          </span>
        </div>
      </div>

      <nav
        aria-label="Menu do coordenador"
        className="-mx-2 flex gap-1 overflow-x-auto px-2 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-max items-center justify-between gap-2 rounded-md px-3 py-2 text-sm tracking-[0.15em] transition-colors hover:bg-white/20 lg:min-w-0 ${
                item.development ? "text-slate-600" : ""
              } ${
                isActive && item.development
                  ? "bg-white/15 font-semibold text-slate-950"
                  : isActive
                    ? "bg-white/25 font-semibold"
                    : "font-medium"
              }`}
            >
              <span className="min-w-0 truncate">{item.label}</span>
              {item.development && (
                <span className="shrink-0 rounded-full bg-slate-400/40 px-1.5 py-0.5 font-medium text-[10px] text-slate-700">
                  Dev
                </span>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setConfirmandoSaida(true)}
          className="flex min-w-max cursor-pointer items-center gap-x-2 rounded-md px-3 py-2 text-left font-semibold text-[#8F1D2C] text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70 lg:mt-2"
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
          description="Voce sera desconectado da area do coordenador."
          confirmLabel="Sair"
          tone="danger"
          onCancel={() => setConfirmandoSaida(false)}
          onConfirm={confirmarSaida}
        />
      )}
    </aside>
  );
};
