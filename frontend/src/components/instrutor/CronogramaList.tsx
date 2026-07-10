"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  adicionarAulaAction,
  atualizarAulaAction,
  removerAulaAction,
} from "@/app/instrutor/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { AtualizarAulaInput, AulaResumo } from "@/types/instrutor";
import { formatData } from "@/utils/format";

interface CronogramaListProps {
  turmaId: string | null;
  aulas: AulaResumo[];
}

type Feedback = { tipo: "ok" | "erro"; texto: string } | null;
type Confirmacao = { tipo: "remover" | "cancelar"; aula: AulaResumo } | null;
type DadosAtualizacaoAula = Omit<AtualizarAulaInput, "turmaId" | "aulaId">;

const STATUS_COR: Record<string, string> = {
  realizada: "bg-emerald-500",
  planejada: "bg-slate-300",
  cancelada: "bg-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  realizada: "Realizada",
  planejada: "Planejada",
  cancelada: "Cancelada",
};

export const CronogramaList = ({ turmaId, aulas }: CronogramaListProps) => {
  const router = useRouter();
  const aulasSeguras = Array.isArray(aulas) ? aulas : [];
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [isRemovendo, startRemocao] = useTransition();
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [isAtualizando, startAtualizacao] = useTransition();
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);
  const [aulaEmEdicao, setAulaEmEdicao] = useState<AulaResumo | null>(null);
  const [edicaoTitulo, setEdicaoTitulo] = useState("");
  const [edicaoData, setEdicaoData] = useState("");
  const [edicaoHoraInicio, setEdicaoHoraInicio] = useState("");
  const [edicaoHoraFim, setEdicaoHoraFim] = useState("");

  const enviar = () => {
    if (!turmaId) return;

    if (titulo.trim() === "") {
      setFeedback({ tipo: "erro", texto: "Informe o titulo da aula." });
      return;
    }

    if (data.trim() === "") {
      setFeedback({ tipo: "erro", texto: "Informe a data da aula." });
      return;
    }

    startTransition(async () => {
      const resultado = await adicionarAulaAction({
        turmaId,
        titulo: titulo.trim(),
        data,
        horaInicio: horaInicio || null,
        horaFim: horaFim || null,
      });

      if (resultado.ok) {
        setFeedback({ tipo: "ok", texto: resultado.mensagem });
        setTitulo("");
        setData("");
        setHoraInicio("");
        setHoraFim("");
        setAberto(false);
        router.refresh();
      } else {
        setFeedback({ tipo: "erro", texto: resultado.erro });
      }
    });
  };

  const confirmarRemocao = (aula: AulaResumo) => {
    if (!turmaId) return;

    setConfirmacao(null);
    setRemovendoId(aula.id);
    startRemocao(async () => {
      const resultado = await removerAulaAction(turmaId, aula.id);

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

  const atualizar = (
    aula: AulaResumo,
    input: DadosAtualizacaoAula,
    aoConcluir?: () => void,
  ) => {
    if (!turmaId) return;

    setAtualizandoId(aula.id);
    startAtualizacao(async () => {
      const resultado = await atualizarAulaAction({
        turmaId,
        aulaId: aula.id,
        ...input,
      });

      setFeedback(
        resultado.ok
          ? { tipo: "ok", texto: resultado.mensagem }
          : { tipo: "erro", texto: resultado.erro },
      );
      setAtualizandoId(null);
      if (resultado.ok) {
        aoConcluir?.();
        router.refresh();
      }
    });
  };

  const abrirEdicao = (aula: AulaResumo) => {
    setFeedback(null);
    setAulaEmEdicao(aula);
    setEdicaoTitulo(aula.titulo);
    setEdicaoData(aula.data);
    setEdicaoHoraInicio(aula.horaInicio ?? "");
    setEdicaoHoraFim(aula.horaFim ?? "");
  };

  const salvarEdicao = () => {
    if (!aulaEmEdicao) return;

    if (edicaoTitulo.trim() === "") {
      setFeedback({ tipo: "erro", texto: "Informe o titulo da aula." });
      return;
    }

    if (edicaoData.trim() === "") {
      setFeedback({ tipo: "erro", texto: "Informe a data da aula." });
      return;
    }

    atualizar(
      aulaEmEdicao,
      {
        titulo: edicaoTitulo.trim(),
        data: edicaoData.trim(),
        horaInicio: edicaoHoraInicio || null,
        horaFim: edicaoHoraFim || null,
      },
      () => setAulaEmEdicao(null),
    );
  };

  return (
    <section
      id="cronograma"
      aria-labelledby="cronograma-heading"
      className="rounded-lg bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="cronograma-heading"
          className="font-semibold text-base text-slate-900"
        >
          Cronograma das aulas
        </h2>

        {turmaId && (
          <button
            type="button"
            onClick={() => {
              setAberto((anterior) => !anterior);
              setFeedback(null);
            }}
            className="cursor-pointer rounded-md bg-brand-dark px-3 py-1.5 font-medium text-white text-xs transition-colors hover:bg-brand-medium"
          >
            {aberto ? "Cancelar" : "+ Adicionar aula"}
          </button>
        )}
      </div>

      {aberto && (
        <div className="mt-4 flex flex-col gap-3 rounded-md bg-slate-50 p-4">
          <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
            Titulo da aula
            <input
              type="text"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
            />
          </label>

          <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
            Data
            <input
              type="date"
              value={data}
              onChange={(evento) => setData(evento.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
              Inicio (opcional)
              <input
                type="time"
                value={horaInicio}
                onChange={(evento) => setHoraInicio(evento.target.value)}
                className="min-w-0 rounded-md border border-slate-300 px-2 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
              />
            </label>

            <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
              Fim (opcional)
              <input
                type="time"
                value={horaFim}
                onChange={(evento) => setHoraFim(evento.target.value)}
                className="min-w-0 rounded-md border border-slate-300 px-2 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={enviar}
              disabled={isPending}
              className="cursor-pointer rounded-md bg-brand-medium px-5 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Salvando..." : "Salvar aula"}
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

      {aulasSeguras.length === 0 ? (
        <p className="mt-4 text-slate-500 text-sm">Nenhuma aula cadastrada.</p>
      ) : (
        <ol className="mt-4 flex flex-col gap-y-2">
          {aulasSeguras.map((aula) => {
            const removendoEsta = isRemovendo && removendoId === aula.id;
            const atualizandoEsta = isAtualizando && atualizandoId === aula.id;

            return (
              <li
                key={aula.id}
                className="flex flex-wrap items-start gap-3 border-slate-100 border-b pb-3 last:border-b-0"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-light/40 font-semibold text-slate-700 text-xs">
                  {aula.numero}
                </span>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium text-slate-800 text-sm leading-snug">
                    {aula.titulo}
                  </span>
                  <span className="text-[0.7rem] text-slate-500">
                    {formatData(aula.data)}
                    {aula.horaInicio && (
                      <>
                        {" "}
                        - {aula.horaInicio}
                        {aula.horaFim ? ` as ${aula.horaFim}` : ""}
                      </>
                    )}
                  </span>
                </div>

                <span className="mt-0.5 inline-flex items-center gap-x-2 rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-600 text-xs">
                  <span
                    title={aula.status}
                    className={`size-2 shrink-0 rounded-full ${
                      STATUS_COR[aula.status] ?? "bg-slate-300"
                    }`}
                  />
                  {STATUS_LABEL[aula.status] ?? aula.status}
                </span>

                {turmaId && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(aula)}
                      disabled={atualizandoEsta}
                      className="cursor-pointer rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 text-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => atualizar(aula, { status: "realizada" })}
                      disabled={atualizandoEsta || aula.status === "realizada"}
                      className="cursor-pointer rounded-md border border-emerald-200 px-2.5 py-1 font-medium text-emerald-700 text-xs transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Realizada
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmacao({ tipo: "cancelar", aula })}
                      disabled={atualizandoEsta || aula.status === "cancelada"}
                      className="cursor-pointer rounded-md border border-amber-200 px-2.5 py-1 font-medium text-amber-700 text-xs transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmacao({ tipo: "remover", aula })}
                      disabled={removendoEsta}
                      title="Remover aula"
                      aria-label="Remover aula"
                      className="shrink-0 cursor-pointer text-red-600 transition-colors hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      >
                        <title>Remover aula</title>
                        <path d="M4 7h16" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                        <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {aulaEmEdicao && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editar-aula-heading"
        >
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="editar-aula-heading"
                  className="font-semibold text-base text-slate-950"
                >
                  Editar aula
                </h3>
                <p className="mt-1 text-slate-500 text-sm">
                  Atualize os dados do cronograma da turma.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAulaEmEdicao(null)}
                disabled={isAtualizando}
                aria-label="Fechar modal"
                className="flex size-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <title>Fechar</title>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
                Titulo da aula
                <input
                  type="text"
                  value={edicaoTitulo}
                  onChange={(evento) => setEdicaoTitulo(evento.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
                />
              </label>

              <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
                Data
                <input
                  type="date"
                  value={edicaoData}
                  onChange={(evento) => setEdicaoData(evento.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
                  Inicio (opcional)
                  <input
                    type="time"
                    value={edicaoHoraInicio}
                    onChange={(evento) =>
                      setEdicaoHoraInicio(evento.target.value)
                    }
                    className="min-w-0 rounded-md border border-slate-300 px-2 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
                  />
                </label>

                <label className="flex flex-col gap-y-1 text-slate-600 text-xs">
                  Fim (opcional)
                  <input
                    type="time"
                    value={edicaoHoraFim}
                    onChange={(evento) => setEdicaoHoraFim(evento.target.value)}
                    className="min-w-0 rounded-md border border-slate-300 px-2 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAulaEmEdicao(null)}
                disabled={isAtualizando}
                className="cursor-pointer rounded-md border border-slate-200 px-4 py-2 font-medium text-slate-700 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarEdicao}
                disabled={isAtualizando}
                className="cursor-pointer rounded-md bg-brand-dark px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAtualizando && atualizandoId === aulaEmEdicao.id
                  ? "Salvando..."
                  : "Salvar alteracoes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmacao && (
        <ConfirmDialog
          title={
            confirmacao.tipo === "remover" ? "Remover aula?" : "Cancelar aula?"
          }
          description={
            confirmacao.tipo === "remover"
              ? `A aula "${confirmacao.aula.titulo}" sera removida do cronograma. Essa acao nao pode ser desfeita.`
              : `A aula "${confirmacao.aula.titulo}" sera marcada como cancelada no cronograma. Os alunos ativos da turma receberao uma notificacao por e-mail.`
          }
          confirmLabel={
            confirmacao.tipo === "remover" ? "Remover aula" : "Cancelar aula"
          }
          tone={confirmacao.tipo === "remover" ? "danger" : "warning"}
          isLoading={isRemovendo || isAtualizando}
          onCancel={() => setConfirmacao(null)}
          onConfirm={() => {
            if (confirmacao.tipo === "remover") {
              confirmarRemocao(confirmacao.aula);
              return;
            }

            const aula = confirmacao.aula;
            setConfirmacao(null);
            atualizar(aula, { status: "cancelada" });
          }}
        />
      )}
    </section>
  );
};
