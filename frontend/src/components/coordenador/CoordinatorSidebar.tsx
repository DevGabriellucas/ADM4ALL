"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/services/sessionService";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/coordenador/dashboard" },
  { label: "Cursos", href: "/coordenador/cursos" },
  { label: "Turmas", href: "/coordenador/turmas" },
  { label: "Alunos", href: "/coordenador/alunos" },
  { label: "Instrutores", href: "/coordenador/instrutores" },
  { label: "Frequência", href: "/coordenador/frequencia" },
  { label: "Cronograma", href: "/coordenador/cronograma" },
  { label: "Certificados", href: "/coordenador/certificados" },
  { label: "Relatórios", href: "/coordenador/relatorios" },
  { label: "Processos", href: "/coordenador/processos" },
  { label: "Usuários", href: "/coordenador/usuarios" },
  { label: "Configurações", href: "/coordenador/configuracoes" },
];

export const CoordinatorSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearSession();
    router.replace("/");
  };

  return (
    <aside className="flex w-full flex-col gap-y-5 bg-brand-medium px-4 py-5 text-slate-950 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:gap-y-8 lg:overflow-y-auto lg:px-6 lg:py-8">
      <div className="flex items-center gap-x-4 lg:flex-col lg:gap-y-3 lg:text-center">
        <span className="flex size-18 items-center justify-center rounded-full border-2 border-[#E7ECF8] bg-brand-dark font-semibold text-lg text-white shadow-md">
          CA
        </span>

        <div className="flex flex-col lg:items-center">
          <span className="font-semibold text-base">Coordenador/Admin</span>
          <span className="text-sm">Área de gestão</span>
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
              className={`min-w-max rounded-md px-3 py-2 text-sm tracking-[0.15em] transition-colors hover:bg-white/20 ${
                isActive ? "bg-white/25 font-semibold" : "font-medium"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={logout}
          className="flex min-w-max items-center gap-x-2 rounded-md px-3 py-2 text-left font-semibold text-[#8F1D2C] text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70 lg:mt-2"
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
    </aside>
  );
};
