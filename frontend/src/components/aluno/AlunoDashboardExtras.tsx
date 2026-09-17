"use client";

import { AlunoCompletionMessage } from "@/components/aluno/AlunoCompletionMessage";
import { FREQUENCIA_MINIMA_APROVACAO } from "@/constants/matriculaStatus";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoDashboardExtrasProps {
  aluno: Pick<
    AlunoDashboard,
    | "curso"
    | "certificadoDisponivel"
    | "certificadoLiberado"
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
        <div className="mt-3 flex items-end justify-between gap-4">
          <strong className="font-semibold text-3xl text-slate-950">
            {aluno.frequencia}%
          </strong>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 text-xs">
            {aluno.faltas} {aluno.faltas === 1 ? "falta" : "faltas"}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${
              aluno.frequencia < FREQUENCIA_MINIMA_APROVACAO
                ? "bg-red-500"
                : "bg-emerald-500"
            }`}
            style={{
              width: `${Math.min(Math.max(aluno.frequencia, 0), 100)}%`,
            }}
          />
        </div>
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
