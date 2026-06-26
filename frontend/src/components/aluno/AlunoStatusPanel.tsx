import { AlunoInfoCard } from "@/components/aluno/AlunoInfoCard";
import type { AlunoDashboard } from "@/types/aluno";
import type { AlunoStatus } from "@/utils/getAlunoStatus";

interface AlunoStatusPanelProps {
  aluno: Pick<
    AlunoDashboard,
    "aulasConcluidas" | "aulasPlanejadas" | "faltas" | "progresso"
  >;
  status: AlunoStatus;
}

const getFaltasHelperText = (status: AlunoStatus) => {
  if (status !== "reprovadoPorFalta") {
    return undefined;
  }

  return "Limite máximo permitido: 2 faltas";
};

export const AlunoStatusPanel = ({ aluno, status }: AlunoStatusPanelProps) => {
  const faltasEmAtencao = status === "reprovadoPorFalta";

  return (
    <div className="bg-[#F1F4FC] px-5 py-8 sm:px-10 lg:px-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-20 md:gap-y-14">
        <AlunoInfoCard
          title="Faltas"
          value={aluno.faltas}
          isWarning={faltasEmAtencao}
          helperText={getFaltasHelperText(status)}
        />

        <AlunoInfoCard title="Progresso" value={`${aluno.progresso}%`} />

        <AlunoInfoCard
          title="Aulas planejadas"
          value={aluno.aulasPlanejadas}
        />

        <AlunoInfoCard title="Aulas concluidas" value={aluno.aulasConcluidas} />
      </div>
    </div>
  );
};
