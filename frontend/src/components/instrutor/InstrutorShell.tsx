"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  InstrutorSidebar,
  instrutorNavItems,
} from "@/components/instrutor/InstrutorSidebar";
import { InstrutorTopbar } from "@/components/instrutor/InstrutorTopbar";
import type { InstrutorResumo } from "@/types/instrutor";

interface InstrutorShellProps {
  instrutor: InstrutorResumo;
  curso: string;
  dataAula: string | null;
  children: ReactNode;
}

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

export const InstrutorShell = ({
  instrutor,
  curso,
  dataAula,
  children,
}: InstrutorShellProps) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const fecharMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") fecharMenu();
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, fecharMenu]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const confirmarSaida = () => {
    window.location.replace("/logout");
  };

  const iniciais = getIniciais(instrutor.nome);
  const avatarUrl = resolverAvatarUrl(instrutor.avatarUrl);

  return (
    <div className="flex min-h-screen flex-col bg-[#EDF1FB] font-poppins text-slate-950 xl:flex-row">
      <InstrutorSidebar instrutor={instrutor} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-medium px-4 py-3 text-slate-950 xl:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-dark bg-center bg-cover font-semibold text-sm text-white"
              style={
                avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined
              }
            >
              {!avatarUrl && iniciais}
            </span>
            <div className="min-w-0">
              <span className="block font-semibold text-sm">Instrutor</span>
              <span className="block truncate text-xs">{instrutor.nome}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-black transition-colors hover:bg-brand-light/80"
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
          aria-label="Menu de navegacao"
        >
          <div className="flex items-center justify-between border-white/20 border-b px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-dark bg-center bg-cover font-semibold text-sm text-white"
                style={
                  avatarUrl
                    ? { backgroundImage: `url(${avatarUrl})` }
                    : undefined
                }
              >
                {!avatarUrl && iniciais}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-950 text-sm">
                  Instrutor
                </p>
                <p className="truncate text-slate-950 text-xs">
                  {instrutor.nome}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fecharMenu}
              aria-label="Fechar menu"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-black transition-colors hover:bg-brand-light/80"
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
            aria-label="Menu do instrutor"
            className="flex-1 overflow-y-auto px-3 py-4"
          >
            {instrutorNavItems.map((item) => {
              const ativo =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={fecharMenu}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex items-center rounded-md px-3 py-2.5 text-sm tracking-[0.15em] transition-colors ${
                    ativo
                      ? "font-bold text-black bg-brand-light/80 hover:bg-brand-light"
                      : "font-semibold text-black hover:bg-brand-light/50"
                  }`}
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-white/20 border-t px-3 py-3">
            <button
              type="button"
              onClick={() => setConfirmandoSaida(true)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md bg-red-600 px-3 py-2.5 text-left font-semibold text-sm text-white tracking-[0.15em] transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
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
            <InstrutorTopbar curso={curso} dataAula={dataAula} />
            {children}
          </div>
        </main>
      </div>

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
    </div>
  );
};
