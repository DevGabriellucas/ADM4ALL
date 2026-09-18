"use client";

import { AlunoCompletionMessage } from "@/components/aluno/AlunoCompletionMessage";
import {
  FALTAS_TOLERADAS,
  MATRICULA_STATUS,
} from "@/constants/matriculaStatus";
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
  const reprovado = aluno.status === MATRICULA_STATUS.REPROVADO_FALTA;
  // Anotado como number: comparar a constante literal com 1 faria o TypeScript
  // recusar a comparacao, e o plural da mensagem deixaria de acompanhar uma
  // futura mudanca do limite.
  const limiteDeFaltas: number = FALTAS_TOLERADAS;

  // Com o cronograma cumprido nao ha proxima aula, e o cartao passa a mostrar a
  // ultima que aconteceu — antes ele dizia "nenhuma aula publicada" para quem
  // tinha o curso inteiro no calendario.
  const aulaJaAconteceu = aluno.proximaAula?.momento === "ultima";

  return (
    <section
      aria-label="Resumo acadêmico"
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-medium text-slate-500 text-sm">
          {aulaJaAconteceu ? "Última aula" : "Próxima aula"}
        </p>
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
            <span
              className={`mt-4 inline-flex rounded-full px-3 py-1 font-semibold text-xs ${
                aulaJaAconteceu
                  ? "bg-slate-100 text-slate-600"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {aulaJaAconteceu ? "Cronograma concluído" : "Aula planejada"}
            </span>
          </>
        ) : (
          <p className="mt-4 text-slate-600 text-sm leading-6">
            Nenhuma aula foi publicada para sua turma.
          </p>
        )}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-medium text-slate-500 text-sm">
          Resumo de frequência
        </p>

        {/* A frequencia e a proporcao de presencas (com as justificadas) sobre
            as chamadas lancadas. Sem chamada nenhuma nao ha proporcao: o cartao
            diz isso, em vez de mostrar 0% para quem ainda nao teve aula. */}
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
            {/* A barra e vermelha por FALTA acima do limite, e nao por estar
                abaixo de 80%: quem tem duas faltas em tres chamadas ja passou
                do limite do periodo inteiro, mesmo com a proporcao ainda
                parecendo alta no comeco do curso. */}
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
        {/* Reprovado tem cartao proprio: "Conclua o curso e mantenha a
            frequência" era um conselho sobre um prazo que ja fechou, e deixava
            o aluno esperando algo que nao vem mais. */}
        <h3
          className={`mt-3 font-semibold text-lg ${
            reprovado && !aluno.certificadoDisponivel
              ? "text-red-700"
              : "text-slate-950"
          }`}
        >
          {aluno.certificadoDisponivel
            ? "Disponível para download no menu de certificados"
            : reprovado
              ? "Não liberado por falta"
              : certificadoAtivo
                ? "Em preparação"
                : "Ainda não liberado"}
        </h3>
        <div className="mt-3 text-slate-600 text-sm leading-6">
          {aluno.certificadoDisponivel
            ? "O certificado está disponível para acesso no menu de certificados."
            : reprovado
              ? `Você foi reprovado por falta nesta turma, então o certificado não será emitido. O limite é de ${limiteDeFaltas} ${limiteDeFaltas === 1 ? "falta" : "faltas"} e você tem ${aluno.faltas}. Procure a coordenação do curso para saber como cursar de novo.`
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
