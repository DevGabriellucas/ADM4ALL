import { ClassesPageContent } from "@/components/coordenador/ClassesPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { configService } from "@/services/configService";
import {
  getClassesPage,
  getCourses,
  getInstructors,
} from "@/services/coordinatorService";
import { paginaDaUrl } from "@/types/paginacao";

interface CoordinatorClassesPageProps {
  searchParams: Promise<{ pagina?: string }>;
}

export default async function CoordinatorClassesPage({
  searchParams,
}: CoordinatorClassesPageProps) {
  const { pagina } = await searchParams;

  // Cursos e instrutores continuam vindo inteiros: alimentam os seletores do
  // formulario de nova turma, que precisa de todas as opcoes.
  const [classes, courses, instructors, configs] = await Promise.all([
    getClassesPage(paginaDaUrl(pagina)),
    getCourses(),
    getInstructors(),
    configService.obter().catch(() => null),
  ]);

  const defaultClassValues = configs
    ? {
        periodoLetivo: configs.periodoLetivo.valor,
        capacidade: String(configs.preferencias.capacidadePadrao),
        status: configs.preferencias.statusPadrao as
          | "planejada"
          | "em_andamento"
          | "encerrada"
          | undefined,
      }
    : undefined;

  return (
    <>
      <BackButton className="mb-4" />
      <ClassesPageContent
        pagina={classes}
        courses={courses}
        instructors={instructors}
        defaultClassValues={defaultClassValues}
      />
    </>
  );
}
