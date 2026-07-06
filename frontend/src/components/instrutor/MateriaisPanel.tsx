"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adicionarMaterialAction,
  atualizarMaterialVisibilidadeAction,
  removerMaterialAction,
} from "@/app/instrutor/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { AulaResumo, MaterialResumo, TipoMaterial } from "@/types/instrutor";
import { formatData, formatTamanho, formatTipoMaterial } from "@/utils/format";

interface MateriaisPanelProps {
  turmaId: string;
  publicadoPorId: string | null;
  materiais: MaterialResumo[];
  aulas: AulaResumo[];
}

type Feedback = { tipo: "ok" | "erro"; texto: string } | null;

const TIPOS: { valor: TipoMaterial; label: string }[] = [
  { valor: "pdf", label: "PDF" },
  { valor: "video", label: "Vídeo" },
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
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

const extensaoDoArquivo = (nome: string) =>
  nome.split(".").pop()?.toLowerCase() ?? "";

const arquivoCompativel = (arquivo: File, tipoSelecionado: TipoMaterial) =>
  EXTENSOES_POR_TIPO[tipoSelecionado].includes(extensaoDoArquivo(arquivo.name));

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

const resolverUrlMaterial = (url: string | null) => {
  if (!url) return null;
  return url.startsWith("/") ? `${API_URL}${url}` : url;
};

export const MateriaisPanel = ({
  turmaId,
  publicadoPorId,
  materiais,
  aulas,
}: MateriaisPanelProps) => {
  const router = useRouter();
  const materiaisSeguros = Array.isArray(materiais) ? materiais : [];
  const aulasSeguras = Array.isArray(aulas) ? aulas : [];
  const arquivoInputRef = useRef<HTMLInputElement>(null);

  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [aulaId, setAulaId] = useState("");
  const [visibilidade, setVisibilidade] = useState<"visivel" | "oculto">(
    "visivel",
  );
  const [tipo, setTipo] = useState<TipoMaterial>("pdf");
  const [url, setUrl] = useState("");
  const [filtroAula, setFiltroAula] = useState("todos");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [isRemovendo, startRemocao] = useTransition();
  const [materialParaRemover, setMaterialParaRemover] =
    useState<MaterialResumo | null>(null);
  const [alternandoVisibilidadeId, setAlternandoVisibilidadeId] =
    useState<string | null>(null);
  const [isAlternandoVisibilidade, startAlternarVisibilidade] =
    useTransition();

  const materiaisFiltrados = useMemo(() => {
    const ordenados = [...materiaisSeguros].sort((a, b) => {
      const aulaA = a.aulaTitulo ?? "Material geral";
      const aulaB = b.aulaTitulo ?? "Material geral";
      const aulaComparacao = aulaA.localeCompare(aulaB);
      return aulaComparacao !== 0
        ? aulaComparacao
        : b.dataPublicacao.localeCompare(a.dataPublicacao);
    });

    if (filtroAula === "todos") return ordenados;
    if (filtroAula === "geral") {
      return ordenados.filter((material) => !material.aulaId);
    }
    return ordenados.filter((material) => material.aulaId === filtroAula);
  }, [filtroAula, materiaisSeguros]);

  const totalVisiveis = materiaisSeguros.filter(
    (material) => material.visibilidade === "visivel",
  ).length;

  const limparFormulario = () => {
    setTitulo("");
    setDescricao("");
    setAulaId("");
    setVisibilidade("visivel");
    setUrl("");
    setArquivo(null);
    setTipo("pdf");
    if (arquivoInputRef.current) {
      arquivoInputRef.current.value = "";
    }
  };

  const enviar = () => {
    if (titulo.trim() === "") {
      setFeedback({ tipo: "erro", texto: "Informe o nome do material." });
      return;
    }

    startTransition(async () => {
      if (arquivo && arquivo.size > TAMANHO_MAXIMO_BYTES) {
        setFeedback({ tipo: "erro", texto: "O arquivo deve ter até 50 MB." });
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
        descricao: descricao.trim() || null,
        tipo,
        urlArquivo: url.trim() || null,
        publicadoPorId,
        aulaId: aulaId || null,
        visibilidade,
        arquivo: arquivoPayload,
      });

      if (resultado.ok) {
        setFeedback({ tipo: "ok", texto: resultado.mensagem });
        limparFormulario();
        setAberto(false);
        router.refresh();
        return;
      }

      setFeedback({ tipo: "erro", texto: resultado.erro });
    });
  };

  const alternarVisibilidade = (material: MaterialResumo) => {
    const novaVisibilidade =
      material.visibilidade === "visivel" ? "oculto" : "visivel";

    setAlternandoVisibilidadeId(material.id);
    startAlternarVisibilidade(async () => {
      const resultado = await atualizarMaterialVisibilidadeAction(
        turmaId,
        material.id,
        novaVisibilidade,
      );

      setFeedback(
        resultado.ok
          ? { tipo: "ok", texto: resultado.mensagem }
          : { tipo: "erro", texto: resultado.erro },
      );
      setAlternandoVisibilidadeId(null);
      if (resultado.ok) {
        router.refresh();
      }
    });
  };

  const remover = (material: MaterialResumo) => {
    setMaterialParaRemover(null);
    setRemovendoId(material.id);
    startRemocao(async () => {
      const resultado = await removerMaterialAction(turmaId, material.id);

      setFeedback(
        resultado.ok
          ? { tipo: "ok", texto: resultado.mensagem }
          : { tipo: "erro", texto: resultado.erro },
      );
      setRemovendoId(null);
      if (resultado.ok) {
        router.refresh();
      }
    });
  };

  const selecionarTipo = (novoTipo: TipoMaterial) => {
    setTipo(novoTipo);

    if (arquivo && !arquivoCompativel(arquivo, novoTipo)) {
      setArquivo(null);
      if (arquivoInputRef.current) {
        arquivoInputRef.current.value = "";
      }
      setFeedback({
        tipo: "erro",
        texto:
          "O arquivo escolhido não é compatível com o novo tipo. Selecione o arquivo novamente.",
      });
    }
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
          Material da turma
        </h2>

        <button
          type="button"
          onClick={() => {
            setAberto((anterior) => !anterior);
            setFeedback(null);
          }}
          className="rounded-md bg-brand-dark px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-medium"
        >
          {aberto ? "Cancelar" : "+ Adicionar material"}
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

          <label className="flex flex-col gap-y-1 text-slate-600 text-xs sm:col-span-2">
            Descrição (opcional)
            <textarea
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
              rows={3}
              className="resize-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
            />
          </label>

          <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
            Tipo
            <select
              value={tipo}
              onChange={(evento) =>
                selecionarTipo(evento.target.value as TipoMaterial)
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
            Aula relacionada (opcional)
            <select
              value={aulaId}
              onChange={(evento) => setAulaId(evento.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
            >
              <option value="">Material geral da turma</option>
              {aulasSeguras.map((aula) => (
                <option key={aula.id} value={aula.id}>
                  Aula {aula.numero} - {aula.titulo}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
            Visibilidade
            <select
              value={visibilidade}
              onChange={(evento) =>
                setVisibilidade(evento.target.value as "visivel" | "oculto")
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
            >
              <option value="visivel">Visível para alunos</option>
              <option value="oculto">Oculto dos alunos</option>
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
            {`Arquivo compatível com o tipo "${
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
                    texto: `O tipo selecionado é "${
                      TIPOS.find((opcao) => opcao.valor === tipo)?.label
                    }", mas o arquivo escolhido é .${extensaoDoArquivo(
                      novoArquivo.name,
                    )}. Escolha um arquivo compatível ou troque o tipo.`,
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

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <label className="flex min-w-[14rem] flex-col gap-y-1 text-slate-600 text-xs">
          Filtrar por aula
          <select
            value={filtroAula}
            onChange={(evento) => setFiltroAula(evento.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
          >
            <option value="todos">Todos os materiais</option>
            <option value="geral">Material geral da turma</option>
            {aulasSeguras.map((aula) => (
              <option key={aula.id} value={aula.id}>
                Aula {aula.numero} - {aula.titulo}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            Total: {materiaisSeguros.length}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
            Visíveis: {totalVisiveis}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
            Ocultos: {materiaisSeguros.length - totalVisiveis}
          </span>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="border-slate-200 border-b text-slate-500 text-xs">
              <th className="py-2 pr-3 font-medium">Nome do material</th>
              <th className="py-2 pr-3 font-medium">Tipo</th>
              <th className="py-2 pr-3 text-center font-medium">Data</th>
              <th className="py-2 pr-3 text-center font-medium">Tamanho</th>
              <th className="py-2 pr-3 text-center font-medium">Visibilidade</th>
              <th className="py-2 text-center font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {materiaisSeguros.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-slate-500">
                  Nenhum material cadastrado.
                </td>
              </tr>
            ) : materiaisFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-slate-500">
                  Nenhum material encontrado para este filtro.
                </td>
              </tr>
            ) : (
              materiaisFiltrados.map((material) => {
                const removendoEste =
                  isRemovendo && removendoId === material.id;
                const urlMaterial = resolverUrlMaterial(material.urlArquivo);

                return (
                  <tr
                    key={material.id}
                    className="border-slate-100 border-b last:border-b-0"
                  >
                    <td className="py-3 pr-3 text-slate-800">
                      <span className="font-medium">{material.titulo}</span>
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600 text-xs">
                        {material.aulaTitulo ?? "Material geral"}
                      </span>
                      {material.descricao && (
                        <span className="mt-1 block max-w-sm text-slate-500 text-xs">
                          {material.descricao}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      <span className="rounded-full bg-brand-light/50 px-2 py-0.5 font-medium text-slate-700 text-xs">
                        {formatTipoMaterial(material.tipo)}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600">
                      {formatData(material.dataPublicacao)}
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600">
                      {formatTamanho(material.tamanhoBytes)}
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-600">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium text-xs ${
                          material.visibilidade === "visivel"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {material.visibilidade === "visivel"
                          ? "Visível"
                          : "Oculto"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-x-3">
                        {urlMaterial ? (
                          <a
                            href={urlMaterial}
                            title="Baixar o arquivo"
                            target="_blank"
                            rel="noreferrer"
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
                              <title>Baixar o arquivo</title>
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
                          onClick={() => alternarVisibilidade(material)}
                          disabled={
                            isAlternandoVisibilidade &&
                            alternandoVisibilidadeId === material.id
                          }
                          title={
                            material.visibilidade === "visivel"
                              ? "Ocultar dos alunos"
                              : "Mostrar para alunos"
                          }
                          aria-label={
                            material.visibilidade === "visivel"
                              ? "Ocultar dos alunos"
                              : "Mostrar para alunos"
                          }
                          className="text-brand-dark transition-colors hover:text-brand-medium disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="font-semibold text-xs">
                            {material.visibilidade === "visivel"
                              ? "Ocultar"
                              : "Mostrar"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMaterialParaRemover(material)}
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

      {materialParaRemover && (
        <ConfirmDialog
          title="Remover material?"
          description={`O material "${materialParaRemover.titulo}" será removido da turma. Essa ação não pode ser desfeita.`}
          confirmLabel="Remover material"
          tone="danger"
          isLoading={isRemovendo}
          onCancel={() => setMaterialParaRemover(null)}
          onConfirm={() => remover(materialParaRemover)}
        />
      )}
    </section>
  );
};
