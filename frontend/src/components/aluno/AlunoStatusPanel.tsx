import { AlunoInfoCard } from "@/components/aluno/AlunoInfoCard";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoStatusPanelProps {
  aluno: Pick<
    AlunoDashboard,
    "documentosPendentes" | "faltas" | "notas" | "progresso"
  >;
}

const getFaltasHelperText = (faltas: AlunoDashboard["faltas"]) => {
  if (faltas <= 20) {
    return undefined;
  }

  return "Atencao: acima do limite recomendado";
};

export const AlunoStatusPanel = ({ aluno }: AlunoStatusPanelProps) => {
  const faltasEmAtencao = aluno.faltas > 20;

  return (
    <div className="bg-[#F1F4FC] px-5 py-8 sm:px-10 lg:px-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-20 md:gap-y-14">
        <AlunoInfoCard
          title="Faltas"
          value={aluno.faltas}
          isWarning={faltasEmAtencao}
          helperText={getFaltasHelperText(aluno.faltas)}
        />

        <AlunoInfoCard title="Progresso" value={`${aluno.progresso}%`} />

        <AlunoInfoCard title="Notas" value={aluno.notas ?? "Sem lancamentos"} />

        <AlunoInfoCard
          title="Documentos pendentes"
          value={aluno.documentosPendentes ?? "Nenhum pendente"}
        />
      </div>
    </div>
  );
};
