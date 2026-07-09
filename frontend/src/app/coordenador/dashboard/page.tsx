import Link from "next/link";
import { AttentionStudentsTable } from "@/components/coordenador/AttentionStudentsTable";
import { CoordinatorStatCard } from "@/components/coordenador/CoordinatorStatCard";
import { DashboardInfoCard } from "@/components/coordenador/DashboardInfoCard";
import { PeriodoLetivoEditor } from "@/components/coordenador/PeriodoLetivoEditor";
import { configService } from "@/services/configService";
import {
  getAttendanceSummary,
  getCertificates,
  getClasses,
  getDashboardSummary,
} from "@/services/coordinatorService";
import { getPeriodoLetivoSeguro } from "@/services/periodoLetivoService";

export default async function CoordinatorDashboardPage() {
  const [summary, classes, attendanceSummary, certificates, periodo, configs] =
    await Promise.all([
      getDashboardSummary(),
      getClasses(),
      getAttendanceSummary(),
      getCertificates(),
      getPeriodoLetivoSeguro(),
      configService.obter().catch(() => null),
    ]);

  const nomeExibido =
    configs?.preferencias.nomeExibido ||
    configs?.instituicao.nome ||
    "ADM4All";

  const activeClasses = classes.filter(
    (classGroup) => classGroup.status === "em_andamento",
  ).length;
  const issuedCertificates = certificates.filter(
    (certificate) => certificate.status === "emitido",
  ).length;
  const attentionStudents = attendanceSummary.filter(
    (student) => student.situacao !== "regular",
  );

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-brand-medium/80 px-5 py-4 text-center text-slate-950">
          <p className="font-semibold text-xs uppercase tracking-[0.35em]">
            {nomeExibido}
          </p>
          <h1 className="mt-1 font-semibold text-base">
            Painel do Coordenador
          </h1>
        </div>

        <div className="rounded-lg bg-brand-light/80 px-5 py-4 text-center text-slate-950">
          <PeriodoLetivoEditor periodoInicial={periodo.periodoLetivo} />
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

      <section aria-label="Alunos em atenção">
        <AttentionStudentsTable students={attentionStudents} />
      </section>

      <section
        aria-label="Resumo operacional"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <DashboardInfoCard
          title="Ativações pendentes"
          value={summary.usuariosPendentes}
          description="Usuários aguardando liberação para acessar o sistema."
        />
        <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-900 text-sm tracking-[0.18em]">
            Relatórios recentes
          </p>

          {summary.relatorios.length > 0 ? (
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
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-slate-500 text-sm">
                Nenhum relatório gerado ainda.
              </p>
              <Link
                href="/coordenador/relatorios"
                className="mt-2 inline-block cursor-pointer font-semibold text-brand-dark text-sm underline transition-colors hover:text-[#23275F]"
              >
                Ir para relatórios
              </Link>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
