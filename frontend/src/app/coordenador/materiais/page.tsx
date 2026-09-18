import { ClassWorkspaceEmptyCard } from "@/components/coordenador/ClassWorkspaceEmptyCard";
import { ClassWorkspaceHeader } from "@/components/coordenador/ClassWorkspaceHeader";
import { MateriaisPanel } from "@/components/instrutor/MateriaisPanel";
import { BackButton } from "@/components/shared/BackButton";
import { carregarWorkspaceDaTurma } from "@/services/coordinatorTurmaWorkspace";
import { dataDaAulaEmFoco } from "@/utils/cronograma";

interface CoordinatorMateriaisPageProps {
  searchParams: Promise<{ turma?: string }>;
}

export default async function CoordinatorMateriaisPage({
  searchParams,
}: CoordinatorMateriaisPageProps) {
  const { turma } = await searchParams;
  const { turmas, turmaSelecionada, painel } =
    await carregarWorkspaceDaTurma(turma);

  return (
    <>
      <BackButton className="mb-4" />

      <ClassWorkspaceHeader
        titulo="Materiais"
        descricao="Publique arquivos e controle o que fica visível para o aluno em qualquer turma."
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        dataAula={dataDaAulaEmFoco(painel)}
      />

      {painel ? (
        // key pela turma: o formulario de publicacao vive em estado local e
        // precisa ser zerado quando a coordenacao troca de turma.
        // publicadoPorId nulo de proposito: o backend grava o autor a partir do
        // JWT (usuario.sub), que e mais confiavel que o id vindo do cookie.
        <MateriaisPanel
          key={painel.turma.id}
          turmaId={painel.turma.id}
          publicadoPorId={null}
          materiais={painel.materiais}
          aulas={painel.cronograma}
        />
      ) : (
        <ClassWorkspaceEmptyCard />
      )}
    </>
  );
}
