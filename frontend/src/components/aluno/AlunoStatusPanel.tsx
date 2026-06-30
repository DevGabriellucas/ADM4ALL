import { AlunoInfoCard } from "@/components/aluno/AlunoInfoCard";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoStatusPanelProps {
  aluno: Pick<
    AlunoDashboard,
    "aulasConcluidas" | "aulasPlanejadas" | "faltas" | "progresso" | "status"
  >;
}

const STATUS_LABELS: Record<AlunoDashboard["status"], string> = {
  em_andamento: "Em andamento",
  aprovado: "Aprovado",
  reprovado_falta: "Reprovado por falta",
  cancelado: "Cancelado",
};

const getFaltasHelperText = (status: AlunoDashboard["status"]) => {
  if (status !== "reprovado_falta") {
    return undefined;
  }

  return "Limite máximo permitido: 2 faltas";
};

export const AlunoStatusPanel = ({ aluno }: AlunoStatusPanelProps) => {
  const faltasEmAtencao = aluno.status === "reprovado_falta";

  return (
    <div className="bg-[#F1F4FC] px-5 py-8 sm:px-10 lg:px-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-20 md:gap-y-14">
        <AlunoInfoCard
          title="Faltas"
          value={aluno.faltas}
          isWarning={faltasEmAtencao}
          helperText={getFaltasHelperText(aluno.status)}
        />

        <AlunoInfoCard title="Progresso" value={`${aluno.progresso}%`} />

        <AlunoInfoCard title="Aulas planejadas" value={aluno.aulasPlanejadas} />

        <AlunoInfoCard title="Aulas concluidas" value={aluno.aulasConcluidas} />

        <AlunoInfoCard title="Status" value={STATUS_LABELS[aluno.status]} />
      </div>
    </div>
  );
};
