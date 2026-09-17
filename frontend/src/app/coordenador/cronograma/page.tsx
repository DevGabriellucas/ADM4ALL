import { ClassWorkspaceEmptyCard } from "@/components/coordenador/ClassWorkspaceEmptyCard";
import { ClassWorkspaceHeader } from "@/components/coordenador/ClassWorkspaceHeader";
import { CronogramaList } from "@/components/instrutor/CronogramaList";
import { BackButton } from "@/components/shared/BackButton";
import { carregarWorkspaceDaTurma } from "@/services/coordinatorTurmaWorkspace";

interface CoordinatorCronogramaPageProps {
  searchParams: Promise<{ turma?: string }>;
}

export default async function CoordinatorCronogramaPage({
  searchParams,
}: CoordinatorCronogramaPageProps) {
  const { turma } = await searchParams;
  const { turmas, turmaSelecionada, painel } =
    await carregarWorkspaceDaTurma(turma);

  return (
    <>
      <BackButton className="mb-4" />

      <ClassWorkspaceHeader
        titulo="Cronograma"
        descricao="Crie, edite e encerre aulas: horário obrigatório e aula realizada só depois do término."
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        dataAula={painel?.aulaAtual?.data ?? null}
      />

      {painel ? (
        // key pela turma: o formulario de nova aula vive em estado local e
        // precisa ser zerado quando a coordenacao troca de turma.
        <CronogramaList
          key={painel.turma.id}
          turmaId={painel.turma.id}
          aulas={painel.cronograma}
        />
      ) : (
        <ClassWorkspaceEmptyCard />
      )}
    </>
  );
}
