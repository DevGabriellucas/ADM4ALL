"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { InstrutorResumo } from "@/types/instrutor";

interface InstrutorSidebarProps {
  instrutor: InstrutorResumo;
}

const NAV_ITENS = [
  { label: "Dashboard", href: "#dashboard", ativo: true },
  { label: "Presença", href: "#presenca", ativo: false },
  { label: "Frequência", href: "#metricas", ativo: false },
  { label: "Cronograma", href: "#cronograma", ativo: false },
  { label: "Materiais", href: "#materiais", ativo: false },
  { label: "Perfil", href: "#dashboard", ativo: false },
  { label: "Configurações", href: "#dashboard", ativo: false },
];

const getIniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return `${primeira}${ultima}`.toUpperCase();
};

export const InstrutorSidebar = ({ instrutor }: InstrutorSidebarProps) => {
  const router = useRouter();

  const sair = () => {
    document.cookie = "adm4all_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "adm4all_perfil=; path=/; max-age=0; SameSite=Lax";
    document.cookie =
      "adm4all_instrutor_id=; path=/; max-age=0; SameSite=Lax";
    router.push("/");
  };

  return (
    <aside className="flex w-full flex-col gap-y-8 bg-brand-medium px-6 py-8 text-slate-950 lg:min-h-screen lg:w-64">
      <div className="flex items-center gap-x-4 lg:flex-col lg:gap-y-3 lg:text-center">
        {instrutor.avatarUrl ? (
          <Image
            src={instrutor.avatarUrl}
            alt={`Avatar de ${instrutor.nome}`}
            width={72}
            height={72}
            unoptimized
            className="size-18 rounded-full border-2 border-[#E7ECF8] object-cover shadow-md"
          />
        ) : (
          <span className="flex size-18 items-center justify-center rounded-full border-2 border-[#E7ECF8] bg-brand-dark font-semibold text-lg text-white shadow-md">
            {getIniciais(instrutor.nome)}
          </span>
        )}

        <div className="flex flex-col lg:items-center">
          <span className="font-semibold text-base">Instrutor</span>
          <span className="text-sm">{instrutor.nome}</span>
        </div>
      </div>

      <nav aria-label="Menu do instrutor" className="flex flex-col gap-y-1">
        {NAV_ITENS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.ativo ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm tracking-[0.15em] transition-colors hover:bg-white/20 ${
              item.ativo ? "bg-white/25 font-semibold" : "font-medium"
            }`}
          >
            {item.label}
          </a>
        ))}

        <button
          type="button"
          onClick={sair}
          className="mt-2 flex items-center gap-x-2 rounded-md px-3 py-2 text-left font-semibold text-red-700 text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5 shrink-0 text-red-700"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
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
