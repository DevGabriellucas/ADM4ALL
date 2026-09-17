import { AlunoInfoCard } from "@/components/aluno/AlunoInfoCard";
import { MATRICULA_STATUS } from "@/constants/matriculaStatus";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoStatusPanelProps {
  aluno: Pick<
    AlunoDashboard,
    | "aulasConcluidas"
    | "aulasPlanejadas"
    | "cursoConcluido"
    | "progresso"
    | "status"
  >;
}

const getProgressClasses = (cursoConcluido: boolean) =>
  cursoConcluido ? "bg-emerald-50 text-emerald-700" : "bg-slate-900 text-white";

const getStatusClasses = (status: AlunoDashboard["status"]) => {
  if (status === MATRICULA_STATUS.REPROVADO_FALTA) {
    return "bg-red-50 text-red-700";
  }

  if (status === MATRICULA_STATUS.APROVADO) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === MATRICULA_STATUS.CANCELADO) {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-slate-900 text-white";
};

const getStatusLabel = (status: AlunoDashboard["status"]) => {
  if (status === MATRICULA_STATUS.APROVADO) {
    return "Aprovado";
  }

  if (status === MATRICULA_STATUS.REPROVADO_FALTA) {
    return "Reprovado";
  }

  if (status === MATRICULA_STATUS.CANCELADO) {
    return "Cancelado";
  }

  return "Em andamento";
};

export const AlunoStatusPanel = ({ aluno }: AlunoStatusPanelProps) => {
  const aulasRestantes = Math.max(
    aluno.aulasPlanejadas - aluno.aulasConcluidas,
    0,
  );
  const progressClasses = getProgressClasses(aluno.cursoConcluido);
  const statusClasses = getStatusClasses(aluno.status);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-slate-500 text-sm">Seu progresso</p>
            <p className="mt-1 font-semibold text-3xl text-slate-950">
              {aluno.progresso}%
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 font-semibold text-xs ${progressClasses}`}
          >
            {aluno.cursoConcluido ? "Concluído" : "Em andamento"}
          </span>
        </div>
        <div
          className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={aluno.progresso}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso do curso: ${aluno.progresso}%`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-medium to-blue-500 transition-all"
            style={{ width: `${Math.min(Math.max(aluno.progresso, 0), 100)}%` }}
          />
        </div>
        <p className="mt-3 text-slate-500 text-sm">
          {aulasRestantes > 0
            ? `Você concluiu ${aluno.aulasConcluidas} de ${aluno.aulasPlanejadas} aulas. Faltam ${aulasRestantes}.`
            : aluno.aulasPlanejadas > 0
              ? "Todas as aulas previstas foram concluídas."
              : "Ainda não há aulas registradas para sua turma."}
        </p>
      </article>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-2">
        <AlunoInfoCard
          title="Aulas"
          value={`${aluno.aulasConcluidas} de ${aluno.aulasPlanejadas}`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-2">
        <p className="font-medium text-slate-500 text-sm">Status do aluno</p>
        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 font-semibold text-sm ${statusClasses}`}
        >
          {getStatusLabel(aluno.status)}
        </span>
      </div>
    </div>
  );
};
