"use client";

import { useState, useTransition } from "react";
import { adicionarMaterialAction } from "@/app/instrutor/actions";
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

const TAMANHO_MAXIMO_BYTES = 50 * 1024 * 1024;

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
        setTipo("pdf");
        setAberto(false);
      } else {
        setFeedback({ tipo: "erro", texto: resultado.erro });
      }
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
              onChange={(evento) =>
                setTipo(evento.target.value as TipoMaterial)
              }
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
            Arquivo PDF, imagem ou video (opcional)
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(evento) =>
                setArquivo(evento.currentTarget.files?.[0] ?? null)
              }
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
              <th className="py-2 pr-3 font-medium">Data</th>
              <th className="py-2 pr-3 font-medium">Tamanho</th>
              <th className="py-2 font-medium">Acoes</th>
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
              materiais.map((material) => (
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
                  <td className="py-3 pr-3 text-slate-600">
                    {formatData(material.dataPublicacao)}
                  </td>
                  <td className="py-3 pr-3 text-slate-600">
                    {formatTamanho(material.tamanhoBytes)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-x-3 text-slate-500">
                      {material.urlArquivo ? (
                        <a
                          href={material.urlArquivo}
                          title="Baixar material"
                          className="transition-colors hover:text-brand-dark"
                        >
                          Baixar
                        </a>
                      ) : (
                        <span title="Sem arquivo" className="opacity-40">
                          Baixar
                        </span>
                      )}
                      <span title="Remover (em breve)" className="opacity-40">
                        Remover
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
