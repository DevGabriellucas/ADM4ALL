"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorSidebar } from "@/components/coordenador/CoordinatorSidebar";
import { coordinatorNavItems } from "@/components/coordenador/coordinatorNavItems";

interface CoordinatorShellWrapperProps {
  children: React.ReactNode;
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

export const CoordinatorShellWrapper = ({
  children,
  nomeUsuario,
  perfilUsuario,
}: CoordinatorShellWrapperProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const cargo = PERFIL_LABEL[perfilUsuario] ?? "Coordenador";

  const fecharMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") fecharMenu();
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, fecharMenu]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const confirmarSaida = () => {
    router.replace("/logout");
  };

  const iniciaisUsuario = getIniciais(nomeUsuario);
  const avatarText = iniciaisUsuario || cargo.charAt(0) || "?";

  return (
    <div className="flex min-h-screen flex-col bg-[#EDF1FB] font-poppins text-slate-950 xl:flex-row">
      <CoordinatorSidebar
        nomeUsuario={nomeUsuario}
        perfilUsuario={perfilUsuario}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-[#7579A9] px-4 py-3 text-slate-950 xl:hidden">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-dark font-semibold text-sm text-white">
              {avatarText}
            </span>
            <span className="font-semibold text-sm">{cargo}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            className="flex size-9 cursor-pointer items-center justify-center rounded-md text-slate-950 transition-colors hover:bg-white/20"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <title>Abrir menu</title>
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
        </header>

        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/50 xl:hidden"
            onClick={fecharMenu}
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand-medium text-slate-950 shadow-xl transition-transform duration-200 xl:hidden ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="flex items-center justify-between border-white/20 border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-dark font-semibold text-sm text-white">
                {avatarText}
              </span>
              <div>
                <p className="font-semibold text-slate-950 text-sm">{cargo}</p>
                {nomeUsuario && (
                  <p className="truncate text-slate-950 text-xs">
                    {nomeUsuario}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={fecharMenu}
              aria-label="Fechar menu"
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-slate-950 transition-colors hover:bg-white/20"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <title>Fechar menu</title>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav
            aria-label="Menu do coordenador"
            className="flex-1 overflow-y-auto px-3 py-4"
          >
            {coordinatorNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={fecharMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm tracking-[0.15em] transition-colors hover:bg-white/20 ${
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
          </nav>

          <div className="border-white/20 border-t px-3 py-3">
            <button
              type="button"
              onClick={() => setConfirmandoSaida(true)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-left font-semibold text-[#8F1D2C] text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70"
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
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 xl:px-10">
          <div className="flex w-full max-w-none flex-col gap-y-6">
            {children}
          </div>
        </main>
      </div>

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
    </div>
  );
};
