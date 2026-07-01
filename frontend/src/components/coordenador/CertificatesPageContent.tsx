"use client";

import { useState } from "react";
import { CertificateTable } from "@/components/coordenador/CertificateTable";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import type {
  CertificateDisplayStatus,
  CertificateRecord,
  ClassGroup,
  Course,
} from "@/types/coordinator";
import { getCertificateStatus } from "@/utils/getCertificateStatus";

interface CertificatesPageContentProps {
  certificates: CertificateRecord[];
  courses: Course[];
  classes: ClassGroup[];
}

export const CertificatesPageContent = ({
  certificates,
  courses,
  classes,
}: CertificatesPageContentProps) => {
  const [courseFilter, setCourseFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    CertificateDisplayStatus | ""
  >("");

  const availableClasses = classes.filter(
    (classGroup) => !courseFilter || classGroup.curso === courseFilter,
  );
  const filteredCertificates = certificates.filter((certificate) => {
    if (courseFilter && certificate.curso !== courseFilter) {
      return false;
    }
    if (classFilter && certificate.turma !== classFilter) {
      return false;
    }
    if (statusFilter && getCertificateStatus(certificate) !== statusFilter) {
      return false;
    }

    return true;
  });

  const eligibleCertificates = filteredCertificates.filter(
    (certificate) => getCertificateStatus(certificate) === "elegivel",
  ).length;
  const pendingCertificates = filteredCertificates.filter(
    (certificate) => getCertificateStatus(certificate) === "pendente",
  ).length;
  const issuedCertificates = filteredCertificates.filter(
    (certificate) => getCertificateStatus(certificate) === "emitido",
  ).length;
  const ineligibleCertificates = filteredCertificates.filter(
    (certificate) => getCertificateStatus(certificate) === "nao_elegivel",
  ).length;

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
          subtitle="Frequência mínima atendida"
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
          subtitle="Frequência abaixo de 80%"
          variant="neutral"
        />
      </section>

      <section
        aria-label="Filtros de certificados"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-xs">
            Curso
            <select
              value={courseFilter}
              onChange={(event) => {
                setCourseFilter(event.target.value);
                setClassFilter("");
              }}
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
              onChange={(event) => setClassFilter(event.target.value)}
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
                setStatusFilter(
                  event.target.value as CertificateDisplayStatus | "",
                )
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
    </>
  );
};
