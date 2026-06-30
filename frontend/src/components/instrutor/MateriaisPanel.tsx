"use client";

import { useRef, useState, useTransition } from "react";
import {
  adicionarMaterialAction,
  removerMaterialAction,
} from "@/app/instrutor/actions";
import type { MaterialResumo, TipoMaterial } from "@/types/instrutor";
import { formatData, formatTamanho, formatTipoMaterial } from "@/utils/format";

interface MateriaisPanelProps {
  turmaId: string;
  publicadoPorId: string | null;
  materiais: MaterialResumo[];
}

type Feedback = { tipo: "ok" | "erro"; texto: string } | null;

const TIPOS: { valor: TipoMaterial; label: string }[] = [
  { valor: "pdf", label: "PDF" },
  { valor: "video", label: "Video" },
  { valor: "imagem", label: "Imagem" },
  { valor: "documento", label: "Documento" },
  { valor: "link", label: "Link" },
  { valor: "outro", label: "Outro" },
];

const ACEITAR_POR_TIPO: Record<TipoMaterial, string> = {
  pdf: ".pdf",
  video: ".mp4,.webm",
  imagem: ".jpg,.jpeg,.png,.gif,.webp",
  documento: ".doc,.docx",
  link: ".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
  outro: ".xls,.xlsx,.ppt,.pptx",
};

const EXTENSOES_POR_TIPO: Record<TipoMaterial, string[]> = {
  pdf: ["pdf"],
  video: ["mp4", "webm"],
  imagem: ["jpg", "jpeg", "png", "gif", "webp"],
  documento: ["doc", "docx"],
  link: [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "mp4",
    "webm",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ],
  outro: ["xls", "xlsx", "ppt", "pptx"],
};

const TAMANHO_MAXIMO_BYTES = 50 * 1024 * 1024;

const extensaoDoArquivo = (nome: string) =>
  nome.split(".").pop()?.toLowerCase() ?? "";

const arquivoCompativel = (arquivo: File, tipoSelecionado: TipoMaterial) => {
  const extensoesPermitidas = EXTENSOES_POR_TIPO[tipoSelecionado];
  return extensoesPermitidas.includes(extensaoDoArquivo(arquivo.name));
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

export const MateriaisPanel = ({
  turmaId,
  publicadoPorId,
  materiais,
}: MateriaisPanelProps) => {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoMaterial>("pdf");
  const [url, setUrl] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [isRemovendo, startRemocao] = useTransition();
  const arquivoInputRef = useRef<HTMLInputElement>(null);

  const enviar = () => {
    if (titulo.trim() === "") {
      setFeedback({ tipo: "erro", texto: "Informe o nome do material." });
      return;
    }

    startTransition(async () => {
      if (arquivo && arquivo.size > TAMANHO_MAXIMO_BYTES) {
        setFeedback({ tipo: "erro", texto: "O arquivo deve ter ate 50MB." });
        return;
      }

      const arquivoPayload = arquivo
        ? {
            nome: arquivo.name,
            tipoMime: arquivo.type || "application/octet-stream",
            conteudoBase64: await arquivoParaBase64(arquivo),
          }
        : null;

      const resultado = await adicionarMaterialAction({
        turmaId,
        titulo: titulo.trim(),
        tipo,
        urlArquivo: url.trim() || null,
        publicadoPorId,
        arquivo: arquivoPayload,
      });

      if (resultado.ok) {
        setFeedback({ tipo: "ok", texto: resultado.mensagem });
        setTitulo("");
        setUrl("");
        setArquivo(null);
        if (arquivoInputRef.current) {
          arquivoInputRef.current.value = "";
        }
        setTipo("pdf");
        setAberto(false);
      } else {
        setFeedback({ tipo: "erro", texto: resultado.erro });
      }
    });
  };

  const remover = (material: MaterialResumo) => {
    const confirmado = window.confirm(
      `Remover o material "${material.titulo}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmado) {
      return;
    }

    setRemovendoId(material.id);
    startRemocao(async () => {
      const resultado = await removerMaterialAction(turmaId, material.id);

      setFeedback(
        resultado.ok
          ? { tipo: "ok", texto: resultado.mensagem }
          : { tipo: "erro", texto: resultado.erro },
      );
      setRemovendoId(null);
    });
  };

  return (
    <section
      id="materiais"
      aria-labelledby="materiais-heading"
      className="rounded-lg bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="materiais-heading"
          className="font-semibold text-base text-slate-900"
        >
          Material da Turma
        </h2>

        <button
          type="button"
          onClick={() => {
            setAberto((anterior) => !anterior);
            setFeedback(null);
          }}
          className="rounded-md bg-brand-dark px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-medium"
        >
          {aberto ? "Cancelar" : "+ Adicionar Material"}
        </button>
      </div>

      {aberto && (
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-md bg-slate-50 p-4 sm:grid-cols-2">
          <label className="flex flex-col gap-y-1 text-slate-600 text-xs sm:col-span-2">
            Nome do material
            <input
              type="text"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
            />
          </label>

          <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
            Tipo
            <select
              value={tipo}
              onChange={(evento) => {
                const novoTipo = evento.target.value as TipoMaterial;
                setTipo(novoTipo);

                if (arquivo && !arquivoCompativel(arquivo, novoTipo)) {
                  setArquivo(null);
                  if (arquivoInputRef.current) {
                    arquivoInputRef.current.value = "";
                  }
                  setFeedback({
                    tipo: "erro",
                    texto:
                      "O arquivo escolhido nao e compativel com o novo tipo. Selecione o arquivo novamente.",
                  });
                }
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
            >
              {TIPOS.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
            URL externa (opcional)
            <input
              type="text"
              value={url}
              onChange={(evento) => setUrl(evento.target.value)}
              placeholder="https://exemplo.com/material.pdf"
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
            />
          </label>

          <label className="flex flex-col gap-y-1 text-slate-600 text-xs sm:col-span-2">
            {`Arquivo compativel com o tipo "${
              TIPOS.find((opcao) => opcao.valor === tipo)?.label
            }" (opcional)`}
            <input
              ref={arquivoInputRef}
              type="file"
              accept={ACEITAR_POR_TIPO[tipo]}
              onChange={(evento) => {
                const novoArquivo = evento.currentTarget.files?.[0] ?? null;

                if (novoArquivo && !arquivoCompativel(novoArquivo, tipo)) {
                  evento.currentTarget.value = "";
                  setArquivo(null);
                  setFeedback({
                    tipo: "erro",
                    texto: `O tipo selecionado e "${
                      TIPOS.find((opcao) => opcao.valor === tipo)?.label
                    }", mas o arquivo escolhido e .${extensaoDoArquivo(
                      novoArquivo.name,
                    )}. Escolha um arquivo compativel ou troque o tipo.`,
                  });
                  return;
                }

                setFeedback(null);
                setArquivo(novoArquivo);
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-medium file:px-3 file:py-1.5 file:text-white focus:border-brand-medium"
            />
            {arquivo && (
              <span className="text-slate-500">
                {arquivo.name} - {formatTamanho(arquivo.size)}
              </span>
            )}
          </label>

          <div className="flex justify-end sm:col-span-2">
            <button
              type="button"
              onClick={enviar}
              disabled={isPending}
              className="rounded-md bg-brand-medium px-5 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Enviando..." : "Salvar material"}
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <output
          className={`mt-3 block text-sm ${
            feedback.tipo === "ok" ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {feedback.texto}
        </output>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="border-slate-200 border-b text-slate-500 text-xs">
              <th className="py-2 pr-3 font-medium">Nome do material</th>
              <th className="py-2 pr-3 font-medium">Tipo</th>
              <th className="py-2 pr-3 text-center font-medium">Data</th>
              <th className="py-2 pr-3 text-center font-medium">Tamanho</th>
              <th className="py-2 text-center font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {materiais.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-slate-500">
                  Nenhum material cadastrado.
                </td>
              </tr>
            ) : (
              materiais.map((material) => {
                const removendoEste =
                  isRemovendo && removendoId === material.id;

                return (
                  <tr
                    key={material.id}
                    className="border-slate-100 border-b last:border-b-0"
                  >
                    <td className="py-3 pr-3 text-slate-800">
                      {material.titulo}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      {formatTipoMaterial(material.tipo)}
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600">
                      {formatData(material.dataPublicacao)}
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600">
                      {formatTamanho(material.tamanhoBytes)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-x-3">
                        {material.urlArquivo ? (
                          <a
                            href={material.urlArquivo}
                            title="Baixa o arquivo"
                            className="text-slate-900 transition-colors hover:text-brand-dark"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="size-5"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            >
                              <title>Baixa o arquivo</title>
                              <path d="M12 4v12" />
                              <path d="M6 12l6 6 6-6" />
                              <path d="M5 21h14" />
                            </svg>
                          </a>
                        ) : (
                          <span
                            title="Sem arquivo"
                            className="text-slate-900 opacity-40"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="size-5"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            >
                              <title>Sem arquivo</title>
                              <path d="M12 4v12" />
                              <path d="M6 12l6 6 6-6" />
                              <path d="M5 21h14" />
                            </svg>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => remover(material)}
                          disabled={removendoEste}
                          title="Remover material"
                          aria-label="Remover material"
                          className="text-red-600 transition-colors hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="size-5"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          >
                            <title>Remover material</title>
                            <path d="M4 7h16" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                            <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
