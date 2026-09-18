import { UsersPageContent } from "@/components/coordenador/UsersPageContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getClasses,
  getCourses,
  getUsersPage,
} from "@/services/coordinatorService";
import { getServerSession } from "@/services/serverSessionService";
import { paginaDaUrl, textoDaUrl } from "@/types/paginacao";

interface CoordinatorUsersPageProps {
  searchParams: Promise<{
    pagina?: string;
    busca?: string;
    perfil?: string;
    status?: string;
    ordenacao?: string;
  }>;
}

export default async function CoordinatorUsersPage({
  searchParams,
}: CoordinatorUsersPageProps) {
  const parametros = await searchParams;

  // Busca, perfil, status e ordenacao rodavam no navegador sobre a lista
  // inteira. Com pagina eles precisam ir ao banco, senao filtrariam apenas a
  // pagina aberta e esconderiam quem esta nas outras.
  const filtros = {
    busca: textoDaUrl(parametros.busca),
    perfil: textoDaUrl(parametros.perfil),
    status: textoDaUrl(parametros.status),
    ordenacao: textoDaUrl(parametros.ordenacao),
  };

  // Cursos e turmas continuam vindo inteiros: alimentam os seletores do
  // formulario de novo usuario.
  const [usuarios, courses, classes, session] = await Promise.all([
    getUsersPage(paginaDaUrl(parametros.pagina), filtros),
    getCourses(),
    getClasses(),
    getServerSession(),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
      <UsersPageContent
        pagina={usuarios}
        filtros={filtros}
        courses={courses}
        classes={classes}
        currentUserId={session?.usuarioId ?? null}
      />
    </>
  );
}
