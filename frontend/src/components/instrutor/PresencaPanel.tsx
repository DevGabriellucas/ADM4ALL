"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  buscarPresencasPorAulaAction,
  salvarPresencasAction,
} from "@/app/instrutor/actions";
import { Notificacao } from "@/components/shared/Notificacao";
import type {
  AlunoPresenca,
  AulaResumo,
  StatusPresenca,
} from "@/types/instrutor";
import { formatData } from "@/utils/format";
import { dataDeHoje } from "@/utils/fusoInstituicao";

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
  const router = useRouter();
  const cronogramaSeguro = Array.isArray(cronograma) ? cronograma : [];
  const alunosSeguro = Array.isArray(alunos) ? alunos : [];
  const [aulaSelecionadaId, setAulaSelecionadaId] = useState<string | null>(
    aulaReferencia?.id ?? cronogramaSeguro[0]?.id ?? null,
  );
  const [alunosAtuais, setAlunosAtuais] =
    useState<AlunoPresenca[]>(alunosSeguro);
  const [statuses, setStatuses] = useState<
    Record<string, StatusPresenca | null>
  >(() => paraStatuses(alunosSeguro));
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

  // Quantos alunos estao sem chamada GRAVADA na aula aberta. Nao e o mesmo que
  // os pendentes do resumo, que olha a turma inteira: este e o que a pessoa
  // ainda consegue resolver sem sair da tela.
  //
  // Le `statusPresenca` (o que esta no banco) e nao `statuses` (o que esta
  // marcado na tela) pelo mesmo motivo do resumo: enquanto ninguem salvou, a
  // chamada continua pendente, por mais botoes que tenham sido clicados.
  const pendentesDaAula = useMemo(
    () => alunosAtuais.filter((aluno) => !aluno.statusPresenca).length,
    [alunosAtuais],
  );

  // Resumo unico da turma, somando TODAS as aulas — nao so a que esta aberta.
  //
  // Conta apenas o que ESTA GRAVADO. Marcar um aluno na tela nao mexe em
  // numero nenhum: a marcacao ainda nao e registro, e ate 18/09 o resumo
  // acompanhava o clique, o que dava ao instrutor um contador que subia antes
  // de "Salvar Presença" e voltava atras se ele desistisse. Os totais por aluno
  // (presencas/justificadas/faltas/aulasRegistradas) ja vem fechados do
  // backend; depois do salvamento o `router.refresh()` traz os novos.
  const resumoPresenca = useMemo(() => {
    const hoje = dataDeHoje();

    // Chamada prevista = aula nao cancelada que ja aconteceu. A aula aberta
    // entra mesmo se for futura, senao marca-la deixava "Pendentes" negativo.
    const aulasPrevistas = cronogramaSeguro.filter(
      (aula) =>
        aula.status !== "cancelada" &&
        (aula.data <= hoje || aula.id === aulaSelecionadaId),
    ).length;

    const total = { presentes: 0, faltas: 0, justificadas: 0 };
    let lancamentos = 0;

    for (const aluno of alunosAtuais) {
      total.presentes += aluno.presencas;
      total.faltas += aluno.faltas;
      total.justificadas += aluno.justificadas;
      lancamentos += aluno.aulasRegistradas;
    }

    return {
      ...total,
      aulasPrevistas,
      // Aluno que entrou depois, ou aula cancelada com chamada ja lancada,
      // deixam o esperado abaixo do lancado: o piso em 0 evita numero negativo.
      pendentes: Math.max(
        0,
        alunosAtuais.length * aulasPrevistas - lancamentos,
      ),
    };
  }, [alunosAtuais, cronogramaSeguro, aulaSelecionadaId]);

  // Chamadas em aberto de OUTRAS aulas. O total da turma ja inclui os
  // pendentes da aula aberta; descontar evita cobrar duas vezes o mesmo aluno
  // no aviso.
  const pendentesDeOutrasAulas = Math.max(
    0,
    resumoPresenca.pendentes - pendentesDaAula,
  );

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
        const alunosResultado = Array.isArray(resultado.alunos)
          ? resultado.alunos
          : [];
        setAlunosAtuais(alunosResultado);
        setStatuses(paraStatuses(alunosResultado));
      } else {
        setAlunosAtuais(alunosSeguro);
        setStatuses(
          Object.fromEntries(
            alunosSeguro.map((aluno) => [aluno.matriculaId, null]),
          ),
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
      if (resultado.ok) {
        router.refresh();
      }
    });
  };

  const desabilitado = isSalvando || isTrocandoAula;

  // Durante a troca de aula a lista fica vazia de proposito, e o resumo cairia
  // para zero: mostrar tracinho evita dar a impressao de que a turma perdeu os
  // lancamentos ja salvos.
  const exibirTotal = (valor: number) => (isTrocandoAula ? "—" : valor);

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

      {cronogramaSeguro.length > 0 && (
        <label className="mt-4 flex flex-col gap-y-1 text-slate-600 text-xs">
          Aula
          <select
            value={aulaSelecionadaId ?? ""}
            onChange={(evento) => trocarAula(evento.target.value)}
            disabled={desabilitado}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm outline-none focus:border-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cronogramaSeguro.map((aula) => (
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

      <section aria-labelledby="resumo-turma-heading" className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3
            id="resumo-turma-heading"
            className="font-semibold text-slate-900 text-sm"
          >
            Resumo da turma
          </h3>
          <span className="text-slate-500 text-xs">
            Todas as aulas ({resumoPresenca.aulasPrevistas}{" "}
            {resumoPresenca.aulasPrevistas === 1
              ? "chamada prevista"
              : "chamadas previstas"}
            )
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="font-medium text-emerald-600 text-xs">
              Presentes
            </div>
            <div className="mt-1 font-bold text-2xl text-emerald-700">
              {exibirTotal(resumoPresenca.presentes)}
            </div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="font-medium text-red-600 text-xs">Faltas</div>
            <div className="mt-1 font-bold text-2xl text-red-700">
              {exibirTotal(resumoPresenca.faltas)}
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="font-medium text-amber-600 text-xs">
              Justificadas
            </div>
            <div className="mt-1 font-bold text-2xl text-amber-700">
              {exibirTotal(resumoPresenca.justificadas)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="font-medium text-slate-600 text-xs">Pendentes</div>
            <div className="mt-1 font-bold text-2xl text-slate-700">
              {exibirTotal(resumoPresenca.pendentes)}
            </div>
          </div>
        </div>
      </section>

      {/* Chamada esquecida so aparecia como um numero no card "Pendentes", que
          e facil de passar batido. O aviso diz o que faltou e onde: o que esta
          aberto na tela (resolve aqui) e o que ficou para tras (troque a aula
          no seletor). Vale para o instrutor e para a coordenacao, que usam
          este mesmo painel. */}
      {!isTrocandoAula && resumoPresenca.pendentes > 0 && (
        <Notificacao posicao="inline" tipo="aviso" className="mt-4">
          {pendentesDaAula > 0 && (
            <>
              Presença não marcada para {pendentesDaAula}{" "}
              {pendentesDaAula === 1 ? "aluno" : "alunos"} nesta aula.
            </>
          )}
          {pendentesDaAula > 0 && pendentesDeOutrasAulas > 0 && " "}
          {pendentesDeOutrasAulas > 0 && (
            <>
              {pendentesDeOutrasAulas}{" "}
              {pendentesDeOutrasAulas === 1
                ? "chamada de outra aula continua"
                : "chamadas de outras aulas continuam"}{" "}
              em aberto — selecione a aula no campo acima para lançar.
            </>
          )}
        </Notificacao>
      )}

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
                      className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors ${
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

      {feedback && (
        <Notificacao
          tipo={feedback.tipo === "ok" ? "sucesso" : "erro"}
          className="mt-5"
        >
          {feedback.texto}
        </Notificacao>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={desabilitado}
          className="cursor-pointer rounded-md bg-brand-dark px-5 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSalvando ? "Salvando..." : "Salvar Presença"}
        </button>
      </div>
    </section>
  );
};
