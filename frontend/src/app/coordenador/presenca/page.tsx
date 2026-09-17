import { ClassWorkspaceEmptyCard } from "@/components/coordenador/ClassWorkspaceEmptyCard";
import { ClassWorkspaceHeader } from "@/components/coordenador/ClassWorkspaceHeader";
import { PresencaPanel } from "@/components/instrutor/PresencaPanel";
import { BackButton } from "@/components/shared/BackButton";
import { carregarWorkspaceDaTurma } from "@/services/coordinatorTurmaWorkspace";
import { resolverChamadaAberta } from "@/services/instrutorService";

interface CoordinatorPresencaPageProps {
  searchParams: Promise<{ turma?: string }>;
}

export default async function CoordinatorPresencaPage({
  searchParams,
}: CoordinatorPresencaPageProps) {
  const { turma } = await searchParams;
  const { turmas, turmaSelecionada, painel } =
    await carregarWorkspaceDaTurma(turma);
  const chamada = painel ? await resolverChamadaAberta(painel) : null;

  return (
    <>
      <BackButton className="mb-4" />

      <ClassWorkspaceHeader
        titulo="Presença"
        descricao="Lance a chamada de qualquer turma, com as mesmas regras do instrutor."
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        dataAula={painel?.aulaAtual?.data ?? null}
      />

      {painel && chamada ? (
        // key pela turma: o painel guarda a marcacao em estado local, e sem
        // remontar ele continuaria mostrando a chamada da turma anterior.
        <PresencaPanel
          key={painel.turma.id}
          turmaId={painel.turma.id}
          aulaReferencia={chamada.aulaSelecionada}
          cronograma={painel.cronograma}
          alunos={chamada.alunos}
        />
      ) : (
        <ClassWorkspaceEmptyCard />
      )}
    </>
  );
}
