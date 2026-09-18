"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  buscarPresencasPorAulaAction,
  salvarPresencasAction,
} from "@/app/instrutor/actions";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { Notificacao } from "@/components/shared/Notificacao";
import type {
  AlunoPresenca,
  AulaResumo,
  StatusPresenca,
} from "@/types/instrutor";
import { AULAS_POR_PERIODO } from "@/utils/cronograma";
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

// A ultima aula do periodo nao tem chamada: a presenca dela vale para a turma
// inteira quando o cronograma marca a aula como realizada. Decisao da
// coordenacao em 18/09.
const ehAulaDeEncerramento = (aula: AulaResumo | undefined | null) =>
  aula?.numero === AULAS_POR_PERIODO;

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

      if (!resultado.ok) {
        return;
      }

      // Os cartoes contam o que esta GRAVADO, e isso mora em `alunosAtuais`.
      // So o `router.refresh()` nao bastava: ele traz props novas do servidor,
      // mas o estado local ja montado continua com os totais velhos, e por isso
      // a contagem so mudava depois de recarregar a pagina na mao. Relendo a
      // chamada aqui, os numeros sobem no mesmo clique.
      const atualizados = await buscarPresencasPorAulaAction(
        turmaId,
        aulaSelecionadaId,
      );

      if (atualizados.ok && Array.isArray(atualizados.alunos)) {
        setAlunosAtuais(atualizados.alunos);
        setStatuses(paraStatuses(atualizados.alunos));
      }

      // Continua valendo para o resto da tela (topo do painel do instrutor,
      // cartoes do dashboard e da coordenacao).
      router.refresh();
    });
  };

  const aulaSelecionada =
    cronogramaSeguro.find((aula) => aula.id === aulaSelecionadaId) ?? null;

  // Na aula de encerramento nao ha o que marcar: o sistema confirma a presenca
  // da turma inteira quando a aula e dada como realizada no cronograma.
  const chamadaAutomatica = ehAulaDeEncerramento(aulaSelecionada);

  const desabilitado = isSalvando || isTrocandoAula;

  // Durante a troca de aula a lista fica vazia de proposito, e o resumo cairia
  // para zero: mostrar tracinho evita dar a impressao de que a turma perdeu os
  // lancamentos ja salvos.
  const exibirTotal = (valor: number) => (isTrocandoAula ? "—" : valor);

  return (
    <>
      {/* Os cartoes ficam FORA do painel branco, logo abaixo de "Curso" e
          "Data da Aula", no mesmo formato dos cartoes da tela de Turmas: a
          contagem e a primeira coisa que se procura ao abrir a chamada, e
          dentro do painel ela ficava no meio da lista de alunos. */}
      <section
        aria-label="Resumo da presença da turma"
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Presenças"
          value={exibirTotal(resumoPresenca.presentes)}
          subtitle="Todas as aulas"
          variant="green"
        />
        <CoordinatorStatCard
          title="Faltas"
          value={exibirTotal(resumoPresenca.faltas)}
          subtitle="Não justificadas"
          variant="red"
        />
        <CoordinatorStatCard
          title="Justificadas"
          value={exibirTotal(resumoPresenca.justificadas)}
          subtitle="Não contam como falta"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Pendentes"
          value={exibirTotal(resumoPresenca.pendentes)}
          subtitle={`${resumoPresenca.aulasPrevistas} ${
            resumoPresenca.aulasPrevistas === 1
              ? "chamada prevista"
              : "chamadas previstas"
          }`}
          variant="neutral"
        />
      </section>

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
              <span className="size-2.5 rounded-full bg-amber-500" />{" "}
              Justificada
            </span>
            {/* Pendente tambem e uma situacao da chamada, e era a unica sem
                legenda: o cinza aparecia no cartao sem nada que o explicasse. */}
            <span className="flex items-center gap-x-1">
              <span className="size-2.5 rounded-full bg-slate-400" /> Pendentes
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
                  {ehAulaDeEncerramento(aula) ? " - encerramento" : ""}
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

        {/* O aviso completo passa e sai de cena em 7s, como o resto do
            sistema. O que fica e a linha curta abaixo, presa ao seletor: sem
            ela, o instrutor voltaria a essa aula sem entender por que os
            botoes estao apagados. */}
        {chamadaAutomatica && (
          <>
            <Notificacao tipo="aviso">
              A aula {AULAS_POR_PERIODO} é a de encerramento e não tem chamada:
              a presença é confirmada para todos os alunos da turma quando ela é
              dada por realizada.
            </Notificacao>
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-xs leading-5">
              Aula de encerramento: presença confirmada automaticamente para a
              turma inteira.
            </p>
          </>
        )}

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
                  <span className="w-5 text-slate-400 text-xs">
                    {indice + 1}
                  </span>
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
                        disabled={chamadaAutomatica}
                        onClick={() =>
                          definirStatus(aluno.matriculaId, opcao.valor)
                        }
                        aria-pressed={selecionado}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          selecionado
                            ? opcao.classes
                            : "cursor-pointer border-slate-300 bg-white text-slate-600 hover:border-brand-medium"
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
            disabled={desabilitado || chamadaAutomatica}
            className="cursor-pointer rounded-md bg-brand-dark px-5 py-2 font-medium text-sm text-white transition-colors hover:bg-brand-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSalvando ? "Salvando..." : "Salvar Presença"}
          </button>
        </div>
      </section>
    </>
  );
};
