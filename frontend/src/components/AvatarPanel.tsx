"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Notificacao } from "@/components/shared/Notificacao";
import type { ArquivoUpload } from "@/types/instrutor";

type ResultadoSalvar =
  | { ok: true; mensagem: string; avatarUrl?: string }
  | { ok: false; erro: string };

type ResultadoRemover =
  | { ok: true; mensagem: string }
  | { ok: false; erro: string };

interface AvatarPanelProps {
  nome: string;
  avatarUrl: string | null;
  descricao?: string;
  salvarAction: (arquivo: ArquivoUpload) => Promise<ResultadoSalvar>;
  removerAction: () => Promise<ResultadoRemover>;
}

type Feedback = { tipo: "ok" | "erro"; texto: string } | null;

const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

const resolverAvatarUrl = (url: string | null) => {
  if (!url) return null;
  return url.startsWith("/") ? `${API_URL}${url}` : url;
};

const getIniciais = (nome?: string | null) => {
  if (!nome) return "?";

  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";

  return `${primeira}${ultima || primeira}`.toUpperCase();
};

const lerArquivoComoBase64 = async (arquivo: File): Promise<string> => {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const resultado = String(reader.result ?? "");
      resolve(resultado.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem."));
    reader.readAsDataURL(arquivo);
  });
};

/**
 * Foto de perfil compartilhada por instrutor, coordenacao e aluno. As tres
 * areas gravam em lugares diferentes, entao quem chama passa as actions.
 */
export const AvatarPanel = ({
  nome,
  avatarUrl,
  descricao = "Use uma imagem quadrada ou centralizada para aparecer bem no seu painel.",
  salvarAction,
  removerAction,
}: AvatarPanelProps) => {
  const router = useRouter();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarAtual, setAvatarAtual] = useState(resolverAvatarUrl(avatarUrl));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();
  const iniciais = useMemo(() => getIniciais(nome), [nome]);
  const imagemExibida = previewUrl ?? avatarAtual;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const limparPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const selecionarArquivo = (event: ChangeEvent<HTMLInputElement>) => {
    const selecionado = event.target.files?.[0] ?? null;
    setFeedback(null);
    setArquivo(null);
    limparPreview();

    if (!selecionado) {
      return;
    }

    if (!TIPOS_PERMITIDOS.includes(selecionado.type)) {
      setFeedback({
        tipo: "erro",
        texto: "Envie uma imagem em JPG, PNG ou WEBP.",
      });
      return;
    }

    if (selecionado.size > TAMANHO_MAXIMO) {
      setFeedback({ tipo: "erro", texto: "A foto deve ter ate 5MB." });
      return;
    }

    setArquivo(selecionado);
    setPreviewUrl(URL.createObjectURL(selecionado));
  };

  const salvar = () => {
    if (!arquivo) {
      setFeedback({ tipo: "erro", texto: "Escolha uma imagem primeiro." });
      return;
    }

    startTransition(async () => {
      try {
        const resultado = await salvarAction({
          nome: arquivo.name,
          tipoMime: arquivo.type,
          conteudoBase64: await lerArquivoComoBase64(arquivo),
        });

        if (resultado.ok) {
          setAvatarAtual(resolverAvatarUrl(resultado.avatarUrl ?? null));
          limparPreview();
          setArquivo(null);
          setFeedback({ tipo: "ok", texto: resultado.mensagem });
          router.refresh();
          return;
        }

        setFeedback({ tipo: "erro", texto: resultado.erro });
      } catch (error) {
        setFeedback({
          tipo: "erro",
          texto:
            error instanceof Error
              ? error.message
              : "Falha ao preparar a imagem.",
        });
      }
    });
  };

  const remover = () => {
    startTransition(async () => {
      const resultado = await removerAction();

      if (resultado.ok) {
        limparPreview();
        setArquivo(null);
        setAvatarAtual(null);
        setFeedback({ tipo: "ok", texto: resultado.mensagem });
        router.refresh();
        return;
      }

      setFeedback({ tipo: "erro", texto: resultado.erro });
    });
  };

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className="flex size-20 shrink-0 overflow-hidden rounded-full border-2 border-[#E7ECF8] bg-brand-dark bg-center bg-cover font-semibold text-2xl text-white shadow-sm"
            style={
              imagemExibida
                ? { backgroundImage: `url(${imagemExibida})` }
                : undefined
            }
          >
            {!imagemExibida && (
              <span className="flex h-full w-full items-center justify-center">
                {iniciais}
              </span>
            )}
          </span>

          <div className="min-w-0">
            <h2 className="font-semibold text-base text-slate-950">
              Foto de perfil
            </h2>
            <p className="mt-1 max-w-xl text-slate-600 text-sm">{descricao}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-64">
          <label className="flex cursor-pointer items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 text-sm transition-colors hover:bg-slate-50">
            Escolher imagem
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selecionarArquivo}
              disabled={isPending}
              className="sr-only"
            />
          </label>
          <button
            type="button"
            onClick={salvar}
            disabled={!arquivo || isPending}
            className="cursor-pointer rounded-md bg-brand-dark px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Salvando..." : "Salvar foto"}
          </button>
          {avatarAtual && (
            <button
              type="button"
              onClick={remover}
              disabled={isPending}
              className="cursor-pointer rounded-md border border-red-200 px-4 py-2 font-medium text-red-700 text-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remover foto
            </button>
          )}
        </div>
      </div>

      {arquivo && (
        <p className="mt-3 truncate text-slate-500 text-xs">
          Selecionado: {arquivo.name}
        </p>
      )}

      {feedback && (
        <Notificacao
          tipo={feedback.tipo === "ok" ? "sucesso" : "erro"}
          className="mt-3"
        >
          {feedback.texto}
        </Notificacao>
      )}
    </section>
  );
};
