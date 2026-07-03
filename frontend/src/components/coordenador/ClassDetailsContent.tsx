import Link from "next/link";
import { ClassDetailsTabs } from "@/components/coordenador/ClassDetailsTabs";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type {
  AttendanceSummary,
  CertificateRecord,
  ClassGroup,
  ClassMaterial,
  Lesson,
  Student,
} from "@/types/coordinator";
import { getCertificateStatus } from "@/utils/getCertificateStatus";

interface ClassDetailsContentProps {
  classGroup: ClassGroup;
  students: Student[];
  lessons: Lesson[];
  attendance: AttendanceSummary[];
  materials: ClassMaterial[];
  certificates: CertificateRecord[];
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(date),
  );
};

const classStatusInfo: Record<
  ClassGroup["status"],
  {
    label: string;
    tone: "green" | "amber" | "red" | "blue";
  }
> = {
  planejada: { label: "Planejada", tone: "amber" },
  em_andamento: { label: "Em andamento", tone: "green" },
  concluida: { label: "Concluída", tone: "blue" },
  cancelada: { label: "Cancelada", tone: "red" },
};

export const ClassDetailsContent = ({
  classGroup,
  students,
  lessons,
  attendance,
  materials,
  certificates,
}: ClassDetailsContentProps) => {
  const status = classStatusInfo[classGroup.status];
  const completedLessons = lessons.filter(
    (lesson) => lesson.status === "realizada",
  ).length;
  const eligibleCertificates = certificates.filter((certificate) => {
    const status = getCertificateStatus(certificate);
    return status !== "nao_elegivel" && status !== "cancelado";
  }).length;

  return (
    <>
      <header className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <Link
          href="/coordenador/turmas"
          className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
        >
          Voltar para turmas
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-semibold text-2xl text-slate-950">
                {classGroup.nome}
              </h1>
              <CoordinatorStatusBadge label={status.label} tone={status.tone} />
            </div>
            <p className="mt-2 text-slate-600 text-sm">{classGroup.curso}</p>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Instrutor responsável
              </dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {classGroup.instrutor}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">Período</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {formatDate(classGroup.dataInicio)} a{" "}
                {formatDate(classGroup.dataTermino)}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section
        aria-label="Indicadores da turma"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Total de alunos"
          value={classGroup.alunos}
          subtitle="Alunos matriculados na turma"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Frequência média"
          value={`${classGroup.frequenciaMedia}%`}
          subtitle="Média consolidada da turma"
          variant="green"
        />
        <CoordinatorStatCard
          title="Aulas concluídas"
          value={completedLessons}
          subtitle={`${lessons.length} aulas no cronograma`}
          variant="blue"
        />
        <CoordinatorStatCard
          title="Certificados elegíveis"
          value={eligibleCertificates}
          subtitle="Pendentes ou já emitidos"
          variant="amber"
        />
      </section>

      <ClassDetailsTabs
        students={students}
        lessons={lessons}
        attendance={attendance}
        materials={materials}
        certificates={certificates}
      />
    </>
  );
};
