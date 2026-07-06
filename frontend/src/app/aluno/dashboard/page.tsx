import Link from "next/link";
import { redirect } from "next/navigation";
import { AlunoCompletionMessage } from "@/components/aluno/AlunoCompletionMessage";
import { AlunoHeader } from "@/components/aluno/AlunoHeader";
import { AlunoStatusPanel } from "@/components/aluno/AlunoStatusPanel";
import { MATRICULA_STATUS } from "@/constants/matriculaStatus";
import { getAlunoDashboard } from "@/services/alunoService";
import { getAlunoSession } from "@/services/serverSessionService";

export default async function AlunoDashboardPage() {
  const session = await getAlunoSession();

  if (!session) {
    redirect("/?redirectTo=/aluno/dashboard");
  }

  const aluno = await getAlunoDashboard();

  return (
    <main className="min-h-screen bg-white px-4 py-6 font-poppins text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-y-10">
        <AlunoHeader aluno={aluno} />

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

          <AlunoStatusPanel aluno={aluno} />
        </section>

        <section
          aria-labelledby="materiais-heading"
          className="flex flex-col gap-y-4 rounded-lg bg-[#F1F4FC] px-5 py-6"
        >
          <h3
            id="materiais-heading"
            className="font-semibold text-sm tracking-[0.35em]"
          >
            Materiais recentes
          </h3>
          <p className="text-slate-600 text-sm">
            Acesse a página de materiais para visualizar os conteúdos
            disponibilizados pelos instrutores.
          </p>
          <Link
            href="/aluno/materiais"
            className="inline-flex w-fit items-center gap-x-1 rounded-md bg-brand-medium px-4 py-2 font-medium text-slate-950 text-sm transition-colors hover:bg-brand-light"
          >
            Ver materiais
          </Link>
        </section>

        {aluno.status === MATRICULA_STATUS.REPROVADO_FALTA && (
          <section
            className="mx-auto max-w-3xl text-center font-medium text-red-800 text-xs leading-6 tracking-[0.25em]"
            role="alert"
          >
            Você foi reprovado por falta. O limite máximo permitido é de 2
            faltas.
          </section>
        )}

        {aluno.status === MATRICULA_STATUS.APROVADO && (
          <AlunoCompletionMessage
            curso={aluno.curso}
            certificadoDisponivel={aluno.certificadoDisponivel}
            certificadoUrl={aluno.certificadoUrl}
          />
        )}
      </div>
    </main>
  );
}
