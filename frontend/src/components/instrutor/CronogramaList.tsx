"use client";

import { useState, useTransition } from "react";
import {
  adicionarAulaAction,
  removerAulaAction,
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
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [isRemovendo, startRemocao] = useTransition();

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

  const remover = (aula: AulaResumo) => {
    if (!turmaId) {
      return;
    }

    const confirmado = window.confirm(
      `Remover a aula "${aula.titulo}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmado) {
      return;
    }

    setRemovendoId(aula.id);
    startRemocao(async () => {
      const resultado = await removerAulaAction(turmaId, aula.id);

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
            const removendoEsta = isRemovendo && removendoId === aula.id;

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
                    onClick={() => remover(aula)}
                    disabled={removendoEsta}
                    title="Remover aula"
                    aria-label="Remover aula"
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
                      <title>Remover aula</title>
                      <path d="M4 7h16" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
