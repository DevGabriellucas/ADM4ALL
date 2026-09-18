import { StudentsPageContent } from "@/components/coordenador/StudentsPageContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getClasses,
  getCourses,
  getStudentsPage,
} from "@/services/coordinatorService";
import { paginaDaUrl } from "@/types/paginacao";

interface CoordinatorStudentsPageProps {
  searchParams: Promise<{ pagina?: string }>;
}

export default async function CoordinatorStudentsPage({
  searchParams,
}: CoordinatorStudentsPageProps) {
  const { pagina } = await searchParams;

  // Cursos e turmas continuam vindo inteiros: alimentam os seletores do
  // formulario de novo aluno, que precisa de todas as opcoes.
  const [alunos, courses, classes] = await Promise.all([
    getStudentsPage(paginaDaUrl(pagina)),
    getCourses(),
    getClasses(),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
      <StudentsPageContent
        pagina={alunos}
        courses={courses}
        classes={classes}
      />
    </>
  );
}
