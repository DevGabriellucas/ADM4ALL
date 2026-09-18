"use client";

import { AlunoCompletionMessage } from "@/components/aluno/AlunoCompletionMessage";
import { FALTAS_TOLERADAS } from "@/constants/matriculaStatus";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoDashboardExtrasProps {
  aluno: Pick<
    AlunoDashboard,
    | "curso"
    | "certificadoDisponivel"
    | "certificadoLiberado"
    | "chamadasLancadas"
    | "faltas"
    | "frequencia"
    | "proximaAula"
    | "status"
  >;
}

const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
};

export const AlunoDashboardExtras = ({ aluno }: AlunoDashboardExtrasProps) => {
  const certificadoAtivo = aluno.certificadoLiberado;
  const semChamada = aluno.chamadasLancadas === 0;

  return (
    <section
      aria-label="Resumo acadêmico"
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-medium text-slate-500 text-sm">Próxima aula</p>
        {aluno.proximaAula ? (
          <>
            <h3 className="mt-3 font-semibold text-lg text-slate-950">
              {aluno.proximaAula.titulo}
            </h3>
            <p className="mt-2 text-slate-600 text-sm">
              {formatarData(aluno.proximaAula.data)}
              {aluno.proximaAula.horaInicio
                ? ` • ${aluno.proximaAula.horaInicio}${aluno.proximaAula.horaFim ? ` às ${aluno.proximaAula.horaFim}` : ""}`
                : ""}
            </p>
            <span className="mt-4 inline-flex rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700 text-xs">
              Aula planejada
            </span>
          </>
        ) : (
          <p className="mt-4 text-slate-600 text-sm leading-6">
            Nenhuma próxima aula foi publicada para sua turma.
          </p>
        )}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-medium text-slate-500 text-sm">
          Resumo de frequência
        </p>

        {/* A frequencia parte de 100 e cai 10 pontos a cada falta nao
            justificada — nao e proporcao de presencas sobre chamadas. Enquanto
            ninguem lancou chamada nenhuma para este aluno, os 100% sao so o
            ponto de partida da regra, e anuncia-los como nota fazia o aluno ler
            frequencia cheia sem ter assistido a uma aula. */}
        {semChamada ? (
          <>
            <strong className="mt-3 block font-semibold text-slate-950 text-xl">
              Sem chamada registrada
            </strong>
            <p className="mt-2 text-slate-600 text-sm leading-6">
              Sua frequência aparece aqui assim que o instrutor lançar a
              primeira chamada da turma.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" />
          </>
        ) : (
          <>
            <div className="mt-3 flex items-end justify-between gap-4">
              <strong className="font-semibold text-3xl text-slate-950">
                {aluno.frequencia}%
              </strong>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 text-xs">
                {aluno.faltas} {aluno.faltas === 1 ? "falta" : "faltas"}
              </span>
            </div>
            {/* A barra e vermelha por FALTA, nao por estar abaixo de 80%. A
                frequencia se acumula ao longo do curso: na segunda aula ate
                quem nunca faltou esta em 20%, e pintar isso de vermelho dizia
                ao aluno que ele estava mal quando ele estava em dia. */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  aluno.faltas > FALTAS_TOLERADAS
                    ? "bg-red-500"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(Math.max(aluno.frequencia, 0), 100)}%`,
                }}
              />
            </div>
          </>
        )}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-medium text-slate-500 text-sm">Certificado</p>
        <h3 className="mt-3 font-semibold text-lg text-slate-950">
          {aluno.certificadoDisponivel
            ? "Disponível para download no menu de certificados"
            : certificadoAtivo
              ? "Em preparação"
              : "Ainda não liberado"}
        </h3>
        <div className="mt-3 text-slate-600 text-sm leading-6">
          {aluno.certificadoDisponivel
            ? "O certificado está disponível para acesso no menu de certificados."
            : certificadoAtivo
              ? "A coordenação emitirá o certificado após a conclusão do processo."
              : "Conclua o curso e mantenha a frequência necessária para liberar seu certificado."}
        </div>
        {aluno.certificadoDisponivel && (
          <div className="mt-3">
            <AlunoCompletionMessage
              curso={aluno.curso}
              certificadoDisponivel
              mostrarMensagem={false}
            />
          </div>
        )}
      </article>
    </section>
  );
};
