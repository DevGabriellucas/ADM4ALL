import { formatData } from "@/utils/format";

interface InstrutorTopbarProps {
  curso: string;
  dataAula: string | null;
}

export const InstrutorTopbar = ({ curso, dataAula }: InstrutorTopbarProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg bg-brand-medium/80 px-5 py-4 text-center text-slate-950">
        <p className="font-semibold text-xs uppercase tracking-[0.35em]">
          Curso
        </p>
        <p className="mt-1 font-medium text-sm sm:text-base">{curso}</p>
      </div>

      <div className="rounded-lg bg-brand-light/80 px-5 py-4 text-center text-slate-950">
        <p className="font-semibold text-xs uppercase tracking-[0.35em]">
          Data da Aula
        </p>
        <p className="mt-1 font-medium text-sm sm:text-base">
          {formatData(dataAula)}
        </p>
      </div>
    </div>
  );
};
