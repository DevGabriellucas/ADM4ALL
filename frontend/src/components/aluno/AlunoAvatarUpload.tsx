"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  removerFotoAlunoAction,
  salvarFotoAlunoAction,
} from "@/app/aluno/actions";
import { Notificacao } from "@/components/shared/Notificacao";

interface AlunoAvatarUploadProps {
  nome: string;
  avatarUrl: string | null;
}

const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"]);
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

const resolverAvatarUrl = (url: string | null) =>
  url ? (url.startsWith("/") ? `${API_URL}${url}` : url) : null;

const lerArquivoComoBase64 = (arquivo: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(String(reader.result ?? "").split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem."));
    reader.readAsDataURL(arquivo);
  });

const getIniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "?";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return `${primeira}${ultima || primeira}`.toUpperCase();
};

export const AlunoAvatarUpload = ({
  nome,
  avatarUrl,
}: AlunoAvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imagem, setImagem] = useState(resolverAvatarUrl(avatarUrl));
  const [feedback, setFeedback] = useState<{
    tipo: "ok" | "erro";
    texto: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setImagem(resolverAvatarUrl(avatarUrl)), [avatarUrl]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const selecionarFoto = (arquivo: File | undefined) => {
    setFeedback(null);
    if (!arquivo) return;
    if (!TIPOS_PERMITIDOS.has(arquivo.type)) {
      setFeedback({
        tipo: "erro",
        texto: "Envie uma imagem em JPG, PNG ou WEBP.",
      });
      return;
    }
    if (arquivo.size === 0 || arquivo.size > TAMANHO_MAXIMO) {
      setFeedback({
        tipo: "erro",
        texto: "A foto deve ter entre 1 byte e 5MB.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const resultado = await salvarFotoAlunoAction({
          nome: arquivo.name,
          tipoMime: arquivo.type,
          conteudoBase64: await lerArquivoComoBase64(arquivo),
        });
        if (!resultado.ok) {
          setFeedback({ tipo: "erro", texto: resultado.erro });
          return;
        }
        setImagem(resolverAvatarUrl(resultado.avatarUrl ?? null));
        setFeedback({ tipo: "ok", texto: resultado.mensagem });
      } catch (error) {
        setFeedback({
          tipo: "erro",
          texto:
            error instanceof Error
              ? error.message
              : "Falha ao atualizar a foto.",
        });
      }
    });
  };

  const removerFoto = () => {
    startTransition(async () => {
      const resultado = await removerFotoAlunoAction();
      if (resultado.ok) {
        setImagem(null);
        setFeedback({ tipo: "ok", texto: resultado.mensagem });
      } else {
        setFeedback({ tipo: "erro", texto: resultado.erro });
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="group relative">
        <div
          role="img"
          aria-label={imagem ? `Foto de ${nome}` : `Iniciais de ${nome}`}
          style={imagem ? { backgroundImage: `url(${imagem})` } : undefined}
          className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#E7ECF8] bg-[#2F3F62] bg-center bg-cover font-semibold text-2xl text-white shadow-md"
        >
          {!imagem && getIniciais(nome)}
        </div>
        {imagem ? (
          <button
            type="button"
            aria-label="Remover foto do perfil"
            title="Remover foto do perfil"
            onClick={removerFoto}
            disabled={isPending}
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-red-700/85 text-white opacity-0 transition-opacity disabled:cursor-wait group-focus-within:opacity-100 group-hover:opacity-100"
          >
            <svg
              aria-hidden="true"
              className="size-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 7h12m-9 0V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-7 0 .75 12h6.5L16 7M10 10.5v5m4-5v5"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            aria-label="Adicionar foto do perfil"
            title="Adicionar foto do perfil"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-slate-950/60 font-bold text-3xl text-white opacity-0 transition-opacity disabled:cursor-wait group-focus-within:opacity-100 group-hover:opacity-100"
          >
            +
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            selecionarFoto(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
          disabled={isPending}
        />
      </div>
      {feedback && (
        <Notificacao
          tipo={feedback.tipo === "ok" ? "sucesso" : "erro"}
          className="-translate-x-1/2 fixed top-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl shadow-lg"
        >
          {feedback.texto}
        </Notificacao>
      )}
    </div>
  );
};
