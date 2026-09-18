import { CoursesPageContent } from "@/components/coordenador/CoursesPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { getCoursesPage } from "@/services/coordinatorService";
import { paginaDaUrl } from "@/types/paginacao";

interface CoordinatorCoursesPageProps {
  searchParams: Promise<{ pagina?: string }>;
}

export default async function CoordinatorCoursesPage({
  searchParams,
}: CoordinatorCoursesPageProps) {
  const { pagina } = await searchParams;
  const cursos = await getCoursesPage(paginaDaUrl(pagina));

  return (
    <>
      <BackButton className="mb-4" />
      <CoursesPageContent pagina={cursos} />
    </>
  );
}
