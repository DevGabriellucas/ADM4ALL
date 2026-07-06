"use client";

import { useState, useTransition } from "react";
import {
  adicionarAulaAction,
  atualizarAulaAction,
} from "@/app/instrutor/actions";
import type { AulaResumo } from "@/types/instrutor";
import { formatData } from "@/utils/format";

interface CronogramaListProps {
  turmaId: string | null;
  aulas: AulaResumo[];
}

type Feedback = { tipo: "ok" | "erro"; texto: string } | null;

const STATUS_COR: Record<string, string> = {
  realizada: "bg-emerald-500",
  planejada: "bg-slate-300",
  cancelada: "bg-red-400",
};

export const CronogramaList = ({ turmaId, aulas }: CronogramaListProps) => {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();
  const [aulaParaCancelar, setAulaParaCancelar] = useState<AulaResumo | null>(
    null,
  );
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [isCancelando, startCancelamento] = useTransition();

  const enviar = () => {
    if (!turmaId) {
      return;
    }

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
      } else {
        setFeedback({ tipo: "erro", texto: resultado.erro });
      }
    });
  };

  const abrirCancelamento = (aula: AulaResumo) => {
    if (!turmaId || aula.status === "cancelada") {
      return;
    }

    setFeedback(null);
    setAulaParaCancelar(aula);
  };

  const cancelarAula = () => {
    if (!turmaId || !aulaParaCancelar) {
      return;
    }

    setCancelandoId(aulaParaCancelar.id);
    startCancelamento(async () => {
      const resultado = await atualizarAulaAction({
        turmaId,
        aulaId: aulaParaCancelar.id,
        status: "cancelada",
      });

      setFeedback(
        resultado.ok
          ? { tipo: "ok", texto: resultado.mensagem }
          : { tipo: "erro", texto: resultado.erro },
      );
      setCancelandoId(null);

      if (resultado.ok) {
        setAulaParaCancelar(null);
      }
    });
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
          Cronograma das Aulas
        </h2>

        {turmaId && (
          <button
            type="button"
            onClick={() => {
              setAberto((anterior) => !anterior);
              setFeedback(null);
            }}
            className="rounded-md bg-brand-dark px-3 py-1.5 font-medium text-white text-xs transition-colors hover:bg-brand-medium"
          >
            {aberto ? "Cancelar" : "+ Adicionar Aula"}
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

          <div className="grid grid-cols-2 gap-3">
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
              className="rounded-md bg-brand-medium px-5 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
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

      {aulas.length === 0 ? (
        <p className="mt-4 text-slate-500 text-sm">Nenhuma aula cadastrada.</p>
      ) : (
        <ol className="mt-4 flex flex-col gap-y-2">
          {aulas.map((aula) => {
            const cancelandoEsta = isCancelando && cancelandoId === aula.id;
            const jaCancelada = aula.status === "cancelada";

            return (
              <li
                key={aula.id}
                className="flex items-start gap-x-3 border-slate-100 border-b pb-2 last:border-b-0"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-light/40 font-semibold text-slate-700 text-xs">
                  {aula.numero}
                </span>

                <div className="flex flex-1 flex-col">
                  <span className="font-medium text-slate-800 text-sm leading-snug">
                    {aula.titulo}
                  </span>
                  <span className="text-[0.7rem] text-slate-500">
                    {formatData(aula.data)}
                  </span>
                </div>

                <span
                  title={aula.status}
                  className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                    STATUS_COR[aula.status] ?? "bg-slate-300"
                  }`}
                />

                {turmaId && (
                  <button
                    type="button"
                    onClick={() => abrirCancelamento(aula)}
                    disabled={cancelandoEsta || jaCancelada}
                    title={jaCancelada ? "Aula ja cancelada" : "Cancelar aula"}
                    aria-label={
                      jaCancelada ? "Aula ja cancelada" : "Cancelar aula"
                    }
                    className="shrink-0 text-red-600 transition-colors hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
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
                      <title>Cancelar aula</title>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 9l6 6" />
                      <path d="M15 9l-6 6" />
                    </svg>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {aulaParaCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancelar-aula-title"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <h3
              id="cancelar-aula-title"
              className="font-semibold text-lg text-slate-950"
            >
              Cancelar aula?
            </h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              A aula "{aulaParaCancelar.titulo}" sera marcada como cancelada. Os
              alunos ativos da turma receberao uma notificacao por e-mail.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setAulaParaCancelar(null)}
                disabled={isCancelando}
                className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={cancelarAula}
                disabled={isCancelando}
                className="rounded-md bg-red-700 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelando ? "Cancelando..." : "Cancelar aula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
