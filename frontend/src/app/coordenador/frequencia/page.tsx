import { ClassWorkspaceEmptyCard } from "@/components/coordenador/ClassWorkspaceEmptyCard";
import { ClassWorkspaceHeader } from "@/components/coordenador/ClassWorkspaceHeader";
import { FrequenciaPanel } from "@/components/instrutor/FrequenciaPanel";
import { BackButton } from "@/components/shared/BackButton";
import { carregarWorkspaceDaTurma } from "@/services/coordinatorTurmaWorkspace";
import { dataDaAulaEmFoco } from "@/utils/cronograma";

interface CoordinatorFrequenciaPageProps {
  searchParams: Promise<{ turma?: string }>;
}

export default async function CoordinatorFrequenciaPage({
  searchParams,
}: CoordinatorFrequenciaPageProps) {
  const { turma } = await searchParams;
  const { turmas, turmaSelecionada, painel } =
    await carregarWorkspaceDaTurma(turma);

  return (
    <>
      <BackButton className="mb-4" />

      <ClassWorkspaceHeader
        titulo="Frequência"
        descricao="Presenças, justificativas e faltas por aluno na turma escolhida."
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        dataAula={dataDaAulaEmFoco(painel)}
      />

      {painel ? (
        <FrequenciaPanel
          frequenciaMedia={painel.metricas.frequenciaMedia}
          alunos={painel.alunos}
          turmaEncerrada={
            painel.turma.status === "encerrada" ||
            painel.turma.status === "concluida"
          }
        />
      ) : (
        <ClassWorkspaceEmptyCard />
      )}
    </>
  );
}
