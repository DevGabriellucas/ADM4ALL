import Image from "next/image";
import { getAlunoDashboard } from "@/services/alunoService";
import type { AlunoDashboard } from "@/types/aluno";

interface DashboardCardProps {
  title: string;
  value: string | number;
  isWarning?: boolean;
  helperText?: string;
}

const DashboardCard = ({
  title,
  value,
  isWarning = false,
  helperText,
}: DashboardCardProps) => {
  return (
    <article className="flex min-h-24 w-full flex-col items-center justify-center border border-[#8D9DB4] bg-[#C9D8EF] px-5 py-4 text-center shadow-sm md:min-h-20">
      <p
        className={`font-medium text-sm tracking-[0.35em] ${
          isWarning ? "text-red-700" : "text-slate-900"
        }`}
      >
        {title}: {value}
      </p>

      {helperText && (
        <p className="mt-2 font-semibold text-[0.7rem] text-red-800 tracking-[0.18em]">
          {helperText}
        </p>
      )}
    </article>
  );
};

const getFaltasHelperText = (faltas: AlunoDashboard["faltas"]) => {
  if (faltas <= 20) {
    return undefined;
  }

  return "Atencao: acima do limite recomendado";
};

export default async function AlunoPage() {
  const aluno = await getAlunoDashboard();
  const faltasEmAtencao = aluno.faltas > 20;

  return (
    <main className="min-h-screen bg-white px-4 py-6 font-poppins text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-y-10">
        <header className="flex min-h-24 w-full items-center justify-center gap-x-5 bg-brand-medium px-5 py-4 text-center text-slate-950 sm:gap-x-7">
          <Image
            src={aluno.avatarUrl}
            alt={`Avatar de ${aluno.nome}`}
            width={80}
            height={80}
            unoptimized
            className="size-20 rounded-full border-2 border-[#E7ECF8] object-cover shadow-md"
          />

          <div className="flex flex-col items-start gap-y-2 text-left">
            <h1 className="font-medium text-base tracking-[0.35em] sm:text-lg">
              {aluno.nome}
            </h1>
            <p className="text-xs tracking-[0.35em] sm:text-sm">
              Matricula: {aluno.matricula}
            </p>
          </div>
        </header>

        <section
          aria-labelledby="curso-heading"
          className="flex flex-col gap-y-6"
        >
          <h2
            id="curso-heading"
            className="font-semibold text-sm tracking-[0.45em]"
          >
            Curso: {aluno.curso}
          </h2>

          <div className="bg-[#F1F4FC] px-5 py-8 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-20 md:gap-y-14">
              <DashboardCard
                title="Faltas"
                value={aluno.faltas}
                isWarning={faltasEmAtencao}
                helperText={getFaltasHelperText(aluno.faltas)}
              />

              <DashboardCard title="Progresso" value={`${aluno.progresso}%`} />

              <DashboardCard
                title="Notas"
                value={aluno.notas ?? "Sem lancamentos"}
              />

              <DashboardCard
                title="Documentos pendentes"
                value={aluno.documentosPendentes ?? "Nenhum pendente"}
              />
            </div>
          </div>
        </section>

        {aluno.progresso === 100 && (
          // biome-ignore lint/a11y/useSemanticElements: role="status" foi solicitado explicitamente para a mensagem de conclusao.
          <section
            className="mx-auto max-w-3xl text-center font-medium text-xs leading-6 tracking-[0.25em]"
            role="status"
          >
            Parabens! Voce concluiu o curso {aluno.curso} com sucesso. Seu
            certificado ja esta disponivel na plataforma.
          </section>
        )}

        <nav
          aria-label="Navegacao visual do dashboard"
          className="mt-auto flex items-center justify-center gap-x-4 pb-2"
        >
          <button
            type="button"
            aria-label="Aluno anterior indisponivel"
            className="px-2 py-1 font-bold text-lg text-slate-950 leading-none"
          >
            {"<"}
          </button>
          <button
            type="button"
            aria-label="Proximo aluno indisponivel"
            className="px-2 py-1 font-bold text-lg text-slate-950 leading-none"
          >
            {">"}
          </button>
        </nav>
      </div>
    </main>
  );
}
