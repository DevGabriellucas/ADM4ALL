import { CertificatesPageContent } from "@/components/coordenador/CertificatesPageContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getCertificatesPage,
  getClasses,
  getCourses,
} from "@/services/coordinatorService";
import { paginaDaUrl, textoDaUrl } from "@/types/paginacao";

interface CoordinatorCertificatesPageProps {
  searchParams: Promise<{
    pagina?: string;
    curso?: string;
    turma?: string;
    status?: string;
  }>;
}

export default async function CoordinatorCertificatesPage({
  searchParams,
}: CoordinatorCertificatesPageProps) {
  const parametros = await searchParams;

  // Os filtros rodavam no navegador sobre a lista inteira. Com pagina eles
  // precisam ir ao banco, senao filtrariam apenas a pagina aberta.
  const filtros = {
    curso: textoDaUrl(parametros.curso),
    turma: textoDaUrl(parametros.turma),
    status: textoDaUrl(parametros.status),
  };

  // Cursos e turmas continuam vindo inteiros: alimentam os proprios seletores
  // de filtro desta tela, que precisam de todas as opcoes.
  const [certificados, courses, classes] = await Promise.all([
    getCertificatesPage(paginaDaUrl(parametros.pagina), filtros),
    getCourses(),
    getClasses(),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
      <CertificatesPageContent
        pagina={certificados}
        filtros={filtros}
        courses={courses}
        classes={classes}
      />
    </>
  );
}
