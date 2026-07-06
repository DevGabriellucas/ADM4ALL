"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { atualizarAvatarAction } from "@/app/instrutor/actions";
import { clearSession } from "@/services/sessionService";
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

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

const getIniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return `${primeira}${ultima}`.toUpperCase();
};

const arquivoParaBase64 = (arquivo: File) =>
  new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = String(leitor.result ?? "");
      resolve(resultado.split(",")[1] ?? "");
    };
    leitor.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });

export const InstrutorSidebar = ({ instrutor }: InstrutorSidebarProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(instrutor.avatarUrl);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sair = () => {
    clearSession();
    router.replace("/");
  };

  const selecionarFoto = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0] ?? null;
    evento.target.value = "";

    if (!arquivo) {
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      setErro("A foto deve ter ate 5MB.");
      return;
    }

    setErro(null);

    startTransition(async () => {
      const conteudoBase64 = await arquivoParaBase64(arquivo);
      const resultado = await atualizarAvatarAction({
        instrutorId: instrutor.id,
        arquivo: {
          nome: arquivo.name,
          tipoMime: arquivo.type || "image/jpeg",
          conteudoBase64,
        },
      });

      if (resultado.ok) {
        setAvatarUrl(resultado.avatarUrl);
        router.refresh();
      } else {
        setErro(resultado.erro);
      }
    });
  };

  return (
    <aside className="flex w-full flex-col gap-y-8 bg-brand-medium px-6 py-8 text-slate-950 lg:min-h-screen lg:w-64">
      <div className="flex items-center gap-x-4 lg:flex-col lg:gap-y-3 lg:text-center">
        <div className="relative">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
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

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            aria-label="Alterar foto de perfil"
            title="Alterar foto de perfil"
            className="-right-1 -bottom-1 absolute flex size-6 items-center justify-center rounded-full border-2 border-[#E7ECF8] bg-brand-dark text-white shadow-md transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <title>Alterar foto de perfil</title>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selecionarFoto}
            className="hidden"
          />
        </div>

        <div className="flex flex-col lg:items-center">
          <span className="font-semibold text-base">Instrutor</span>
          <span className="text-sm">{instrutor.nome}</span>
          {erro && <span className="text-red-700 text-xs">{erro}</span>}
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
          className="mt-2 flex cursor-pointer items-center gap-x-2 rounded-md px-3 py-2 text-left font-semibold text-red-700 text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70"
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
    </aside>
  );
};
