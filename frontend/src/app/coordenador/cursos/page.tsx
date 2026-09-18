import { CoursesPageContent } from "@/components/coordenador/CoursesPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { configService } from "@/services/configService";
import { getCoursesPage } from "@/services/coordinatorService";
import { paginaDaUrl } from "@/types/paginacao";

interface CoordinatorCoursesPageProps {
  searchParams: Promise<{ pagina?: string }>;
}

export default async function CoordinatorCoursesPage({
  searchParams,
}: CoordinatorCoursesPageProps) {
  const { pagina } = await searchParams;

  // O periodo letivo configurado so preenche o campo do formulario de novo
  // curso. Se a configuracao falhar, o campo abre vazio e a tela continua de pe.
  const [cursos, configs] = await Promise.all([
    getCoursesPage(paginaDaUrl(pagina)),
    configService.obter().catch(() => null),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
      <CoursesPageContent
        pagina={cursos}
        periodoLetivoPadrao={configs?.periodoLetivo.valor}
      />
    </>
  );
}
