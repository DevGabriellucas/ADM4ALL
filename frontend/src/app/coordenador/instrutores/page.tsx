import { InstructorsPageContent } from "@/components/coordenador/InstructorsPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { getInstructorsPage } from "@/services/coordinatorService";
import { paginaDaUrl } from "@/types/paginacao";

interface CoordinatorInstructorsPageProps {
  searchParams: Promise<{ pagina?: string }>;
}

export default async function CoordinatorInstructorsPage({
  searchParams,
}: CoordinatorInstructorsPageProps) {
  const { pagina } = await searchParams;
  const instrutores = await getInstructorsPage(paginaDaUrl(pagina));

  return (
    <>
      <BackButton className="mb-4" />
      <InstructorsPageContent pagina={instrutores} />
    </>
  );
}
