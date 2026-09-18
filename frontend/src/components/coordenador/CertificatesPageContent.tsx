"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { CertificateTable } from "@/components/coordenador/CertificateTable";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { Paginacao } from "@/components/shared/Paginacao";
import type {
  ClassGroup,
  Course,
  PaginaDeCertificados,
} from "@/types/coordinator";

export type FiltrosDeCertificados = Record<string, string | undefined> & {
  curso?: string | undefined;
  turma?: string | undefined;
  status?: string | undefined;
};

interface CertificatesPageContentProps {
  pagina: PaginaDeCertificados;
  filtros: FiltrosDeCertificados;
  courses: Course[];
  classes: ClassGroup[];
}

export const CertificatesPageContent = ({
  pagina,
  filtros,
  courses,
  classes,
}: CertificatesPageContentProps) => {
  const router = useRouter();

  const courseFilter = filtros.curso ?? "";
  const classFilter = filtros.turma ?? "";
  const statusFilter = filtros.status ?? "";

  // A tabela mostra a pagina; os cartoes contam o resultado FILTRADO inteiro e
  // vem do servidor. Contar sobre `itens` faria os numeros mudarem a cada
  // pagina.
  const filteredCertificates = pagina.itens;
  const eligibleCertificates = pagina.resumo.elegiveis;
  const pendingCertificates = pagina.resumo.pendentes;
  const issuedCertificates = pagina.resumo.emitidos;
  const ineligibleCertificates = pagina.resumo.inelegiveis;

  const availableClasses = classes.filter(
    (classGroup) => !courseFilter || classGroup.curso === courseFilter,
  );

  const aplicarFiltros = useCallback(
    (novos: FiltrosDeCertificados) => {
      const query = new URLSearchParams();
      const combinado: FiltrosDeCertificados = {
        curso: courseFilter,
        turma: classFilter,
        status: statusFilter,
        ...novos,
      };

      for (const [chave, valor] of Object.entries(combinado)) {
        if (valor) query.set(chave, valor);
      }

      // Volta para a primeira pagina: o resultado mudou.
      const texto = query.toString();
      router.push(
        texto
          ? `/coordenador/certificados?${texto}`
          : "/coordenador/certificados",
      );
    },
    [router, courseFilter, classFilter, statusFilter],
  );

  return (
    <>
      <CoordinatorPageHeader
        title="Certificados"
        subtitle="Gerencie elegibilidade e emissão de certificados"
      />

      <section
        aria-label="Indicadores de certificados"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Elegíveis"
          value={eligibleCertificates}
          subtitle="Aptos para emissão"
          variant="blue"
        />
        <CoordinatorStatCard
          title="Pendentes"
          value={pendingCertificates}
          subtitle="Aguardando conclusão da emissão"
          variant="amber"
        />
        <CoordinatorStatCard
          title="Emitidos"
          value={issuedCertificates}
          subtitle="Certificados disponíveis"
          variant="green"
        />
        <CoordinatorStatCard
          title="Não elegíveis"
          value={ineligibleCertificates}
          subtitle="Vínculo ainda não apto"
          variant="neutral"
        />
      </section>

      <section
        aria-label="Filtros de certificados"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Curso
            <select
              value={courseFilter}
              onChange={(event) =>
                // Trocar de curso zera a turma: a lista depende dele.
                aplicarFiltros({ curso: event.target.value, turma: "" })
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.nome}>
                  {course.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Turma
            <select
              value={classFilter}
              onChange={(event) =>
                aplicarFiltros({ turma: event.target.value })
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todas as turmas</option>
              {availableClasses.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.nome}>
                  {classGroup.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Status do certificado
            <select
              value={statusFilter}
              onChange={(event) =>
                aplicarFiltros({ status: event.target.value })
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Todos os status</option>
              <option value="elegivel">Elegível</option>
              <option value="pendente">Pendente</option>
              <option value="emitido">Emitido</option>
              <option value="cancelado">Cancelado</option>
              <option value="nao_elegivel">Não elegível</option>
            </select>
          </label>
        </div>
      </section>

      <CertificateTable certificates={filteredCertificates} />

      <Paginacao
        pagina={pagina.pagina}
        porPagina={pagina.porPagina}
        total={pagina.total}
        href="/coordenador/certificados"
        parametros={filtros}
        rotulo="certificado"
      />
    </>
  );
};
