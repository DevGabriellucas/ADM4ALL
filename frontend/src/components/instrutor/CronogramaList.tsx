import type { AulaResumo } from "@/types/instrutor";
import { formatData } from "@/utils/format";

interface CronogramaListProps {
  aulas: AulaResumo[];
}

const STATUS_COR: Record<string, string> = {
  realizada: "bg-emerald-500",
  planejada: "bg-slate-300",
  cancelada: "bg-red-400",
};

export const CronogramaList = ({ aulas }: CronogramaListProps) => {
  return (
    <section
      id="cronograma"
      aria-labelledby="cronograma-heading"
      className="rounded-lg bg-white p-5 shadow-sm"
    >
      <h2
        id="cronograma-heading"
        className="mb-4 font-semibold text-base text-slate-900"
      >
        Cronograma das Aulas
      </h2>

      {aulas.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhuma aula cadastrada.</p>
      ) : (
        <ol className="flex flex-col gap-y-2">
          {aulas.map((aula) => (
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
                className={`mt-1 size-2.5 shrink-0 rounded-full ${
                  STATUS_COR[aula.status] ?? "bg-slate-300"
                }`}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
