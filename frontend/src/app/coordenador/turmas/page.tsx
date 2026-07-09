import { ClassesPageContent } from "@/components/coordenador/ClassesPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { configService } from "@/services/configService";
import {
  getClasses,
  getCourses,
  getInstructors,
} from "@/services/coordinatorService";

export default async function CoordinatorClassesPage() {
  const [classes, courses, instructors, configs] = await Promise.all([
    getClasses(),
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
        classes={classes}
        courses={courses}
        instructors={instructors}
        defaultClassValues={defaultClassValues}
      />
    </>
  );
}
