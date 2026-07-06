import { AlunoInfoCard } from "@/components/aluno/AlunoInfoCard";
import {
  getMatriculaStatusInfo,
  MATRICULA_STATUS,
} from "@/constants/matriculaStatus";
import type { AlunoDashboard } from "@/types/aluno";

interface AlunoStatusPanelProps {
  aluno: Pick<
    AlunoDashboard,
    "aulasConcluidas" | "aulasPlanejadas" | "faltas" | "progresso" | "status"
  >;
}

const getFaltasHelperText = (status: AlunoDashboard["status"]) => {
  if (status !== MATRICULA_STATUS.REPROVADO_FALTA) {
    return undefined;
  }

  return "O certificado exige menos de 3 faltas.";
};

export const AlunoStatusPanel = ({ aluno }: AlunoStatusPanelProps) => {
  const faltasEmAtencao = aluno.status === MATRICULA_STATUS.REPROVADO_FALTA;

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

        <AlunoInfoCard
          title="Aulas"
          value={`${aluno.aulasConcluidas} de ${aluno.aulasPlanejadas}`}
        />

        <AlunoInfoCard
          title="Status"
          value={getMatriculaStatusInfo(aluno.status).label}
        />
      </div>
    </div>
  );
};
