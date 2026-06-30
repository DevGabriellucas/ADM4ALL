"use client";

import { useMemo, useState, useTransition } from "react";
import {
  buscarPresencasPorAulaAction,
  salvarPresencasAction,
} from "@/app/instrutor/actions";
import type {
  AlunoPresenca,
  AulaResumo,
  StatusPresenca,
} from "@/types/instrutor";
import { formatData } from "@/utils/format";

interface PresencaPanelProps {
  turmaId: string;
  aulaReferencia: AulaResumo | null;
  cronograma: AulaResumo[];
  alunos: AlunoPresenca[];
}

type Feedback = { tipo: "ok" | "erro"; texto: string } | null;

const OPCOES: { valor: StatusPresenca; label: string; classes: string }[] = [
  {
    valor: "presente",
    label: "Presente",
    classes: "border-emerald-500 bg-emerald-500 text-white",
  },
  {
    valor: "falta",
    label: "Falta",
    classes: "border-red-500 bg-red-500 text-white",
  },
  {
    valor: "justificada",
    label: "Justificada",
    classes: "border-amber-500 bg-amber-500 text-white",
  },
];

const paraStatuses = (alunos: AlunoPresenca[]) =>
  Object.fromEntries(
    alunos.map((aluno) => [aluno.matriculaId, aluno.statusPresenca]),
  );

export const PresencaPanel = ({
  turmaId,
  aulaReferencia,
  cronograma,
  alunos,
}: PresencaPanelProps) => {
  const [aulaSelecionadaId, setAulaSelecionadaId] = useState<string | null>(
    aulaReferencia?.id ?? cronograma[0]?.id ?? null,
  );
  const [alunosAtuais, setAlunosAtuais] = useState<AlunoPresenca[]>(alunos);
  const [statuses, setStatuses] = useState<
    Record<string, StatusPresenca | null>
  >(() => paraStatuses(alunos));
  const [busca, setBusca] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSalvando, startSalvando] = useTransition();
  const [isTrocandoAula, startTrocaAula] = useTransition();

  const alunosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return alunosAtuais;
    }
    return alunosAtuais.filter((aluno) =>
      aluno.nome.toLowerCase().includes(termo),
    );
  }, [alunosAtuais, busca]);

  const definirStatus = (matriculaId: string, status: StatusPresenca) => {
    setStatuses((anterior) => ({ ...anterior, [matriculaId]: status }));
    setFeedback(null);
  };

  // Troca de aula: zera qualquer selecao em andamento e busca a presenca
  // ja salva (se houver) para a aula escolhida, sem herdar nada da anterior.
  const trocarAula = (novaAulaId: string) => {
    setAulaSelecionadaId(novaAulaId);
    setBusca("");
    setFeedback(null);
    setStatuses({});
    setAlunosAtuais([]);

    startTrocaAula(async () => {
      const resultado = await buscarPresencasPorAulaAction(turmaId, novaAulaId);

      if (resultado.ok) {
        setAlunosAtuais(resultado.alunos);
        setStatuses(paraStatuses(resultado.alunos));
      } else {
        setAlunosAtuais(alunos);
        setStatuses(
          Object.fromEntries(alunos.map((aluno) => [aluno.matriculaId, null])),
        );
        setFeedback({ tipo: "erro", texto: resultado.erro });
      }
    });
  };

  const salvar = () => {
    if (!aulaSelecionadaId) {
      setFeedback({
        tipo: "erro",
        texto: "Nenhuma aula disponível para registrar presença.",
      });
      return;
    }

    const registros = alunosAtuais
      .map((aluno) => ({
        matriculaId: aluno.matriculaId,
        status: statuses[aluno.matriculaId],
      }))
      .filter(
        (
          registro,
        ): registro is { matriculaId: string; status: StatusPresenca } =>
          registro.status !== null && registro.status !== undefined,
      );

    if (registros.length === 0) {
      setFeedback({
        tipo: "erro",
        texto: "Marque a presença de pelo menos um aluno.",
      });
      return;
    }

    startSalvando(async () => {
      const resultado = await salvarPresencasAction({
        turmaId,
        aulaId: aulaSelecionadaId,
        registros,
      });

      setFeedback(
        resultado.ok
          ? { tipo: "ok", texto: resultado.mensagem }
          : { tipo: "erro", texto: resultado.erro },
      );
    });
  };

  const desabilitado = isSalvando || isTrocandoAula;

  return (
    <section
      id="presenca"
      aria-labelledby="presenca-heading"
      className="rounded-lg bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="presenca-heading"
          className="font-semibold text-base text-slate-900"
        >
          Presença - Alunos
        </h2>

        <div className="flex items-center gap-x-4 text-xs">
          <span className="flex items-center gap-x-1">
            <span className="size-2.5 rounded-full bg-emerald-500" /> Presente
          </span>
          <span className="flex items-center gap-x-1">
            <span className="size-2.5 rounded-full bg-red-500" /> Falta
          </span>
          <span className="flex items-center gap-x-1">
            <span className="size-2.5 rounded-full bg-amber-500" /> Justificada
          </span>
        </div>
      </div>

      {cronograma.length > 0 && (
        <label className="mt-4 flex flex-col gap-y-1 text-slate-600 text-xs">
          Aula
          <select
            value={aulaSelecionadaId ?? ""}
            onChange={(evento) => trocarAula(evento.target.value)}
            disabled={desabilitado}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cronograma.map((aula) => (
              <option key={aula.id} value={aula.id}>
                Aula {aula.numero} - {aula.titulo} ({formatData(aula.data)})
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="relative mt-4">
        <svg
          viewBox="0 0 24 24"
          className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <title>Buscar</title>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          type="search"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar alunos"
          disabled={isTrocandoAula}
          className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-slate-100">
        {isTrocandoAula ? (
          <li className="py-4 text-slate-500 text-sm">
            Carregando presença da aula...
          </li>
        ) : alunosFiltrados.length === 0 ? (
          <li className="py-4 text-slate-500 text-sm">
            Nenhum aluno encontrado.
          </li>
        ) : (
          alunosFiltrados.map((aluno, indice) => (
            <li
              key={aluno.matriculaId}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="flex items-center gap-x-3">
                <span className="w-5 text-slate-400 text-xs">{indice + 1}</span>
                <span className="font-medium text-slate-800 text-sm">
                  {aluno.nome}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {OPCOES.map((opcao) => {
                  const selecionado =
                    statuses[aluno.matriculaId] === opcao.valor;
                  return (
                    <button
                      key={opcao.valor}
                      type="button"
                      onClick={() =>
                        definirStatus(aluno.matriculaId, opcao.valor)
                      }
                      aria-pressed={selecionado}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        selecionado
                          ? opcao.classes
                          : "border-slate-300 bg-white text-slate-600 hover:border-brand-medium"
                      }`}
                    >
                      {opcao.label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        {feedback && (
          <output
            className={`text-sm ${
              feedback.tipo === "ok" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {feedback.texto}
          </output>
        )}

        <button
          type="button"
          onClick={salvar}
          disabled={desabilitado}
          className="rounded-md bg-brand-dark px-5 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSalvando ? "Salvando..." : "Salvar Presença"}
        </button>
      </div>
    </section>
  );
};
