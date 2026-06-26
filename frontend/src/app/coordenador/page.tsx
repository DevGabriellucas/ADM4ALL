import { AttentionStudentsTable } from "@/components/coordenador/AttentionStudentsTable";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { DashboardInfoCard } from "@/components/coordenador/DashboardInfoCard";
import { UpcomingLessonsList } from "@/components/coordenador/UpcomingLessonsList";
import {
  getAttendanceSummary,
  getCertificates,
  getClasses,
  getDashboardSummary,
  getLessons,
  getProcesses,
} from "@/services/coordinatorService";
import { getLessonScheduleStatus } from "@/utils/getLessonScheduleStatus";

export default async function CoordenadorPage() {
  const [
    summary,
    classes,
    attendanceSummary,
    lessons,
    certificates,
    processes,
  ] = await Promise.all([
    getDashboardSummary(),
    getClasses(),
    getAttendanceSummary(),
    getLessons(),
    getCertificates(),
    getProcesses(),
  ]);

  const activeClasses = classes.filter(
    (classGroup) => classGroup.status === "em_andamento",
  ).length;
  const issuedCertificates = certificates.filter(
    (certificate) => certificate.status === "emitido",
  ).length;
  const attentionStudents = attendanceSummary.filter(
    (student) => student.situacao !== "regular",
  );
  const upcomingLessons = lessons
    .filter((lesson) => getLessonScheduleStatus(lesson) === "proxima")
    .slice(0, 4);
  const processesInProgress = processes.filter(
    (process) => process.status === "em_analise",
  ).length;

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-brand-medium/80 px-5 py-4 text-center text-slate-950">
          <p className="font-semibold text-xs uppercase tracking-[0.35em]">
            ADM4All
          </p>
          <h1 className="mt-1 font-semibold text-base">
            Painel do Coordenador
          </h1>
        </div>

        <div className="rounded-lg bg-brand-light/80 px-5 py-4 text-center text-slate-950">
          <p className="font-semibold text-xs uppercase tracking-[0.35em]">
            Período letivo
          </p>
          <p className="mt-1 font-medium text-sm sm:text-base">2026.1</p>
        </div>
      </section>

      <section
        aria-label="Indicadores principais"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CoordinatorStatCard
          title="Total de alunos"
          value={summary.totalAlunos}
          subtitle="Alunos cadastrados no período"
          variant="neutral"
        />
        <CoordinatorStatCard
          title="Turmas ativas"
          value={activeClasses}
          subtitle={`${summary.totalTurmas} turmas cadastradas`}
          variant="blue"
        />
        <CoordinatorStatCard
          title="Frequência média"
          value={`${summary.frequenciaMedia}%`}
          subtitle="Média geral das turmas"
          variant="green"
        />
        <CoordinatorStatCard
          title="Certificados emitidos"
          value={issuedCertificates}
          subtitle={`${summary.certificadosPendentes} pendentes`}
          variant="amber"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(22rem,0.8fr)]">
        <AttentionStudentsTable students={attentionStudents} />
        <UpcomingLessonsList lessons={upcomingLessons} />
      </div>

      <section
        aria-label="Resumo operacional"
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <DashboardInfoCard
          title="Ativações pendentes"
          value={summary.usuariosPendentes}
          description="Usuários aguardando liberação para acessar o sistema."
        />
        <DashboardInfoCard
          title="Processos em andamento"
          value={processesInProgress}
          description={`${summary.processosAbertos} processos ainda estão abertos.`}
        />
        <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-900 text-sm tracking-[0.18em]">
            Relatórios recentes
          </p>

          <div className="mt-4 flex flex-col gap-y-3">
            {summary.relatorios.slice(0, 3).map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="font-semibold text-slate-900 text-sm">
                  {report.titulo}
                </p>
                <p className="mt-1 text-slate-500 text-xs leading-5">
                  {report.descricao}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
