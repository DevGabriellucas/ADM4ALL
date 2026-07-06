import { redirect } from "next/navigation";
import { AlunoHeader } from "@/components/aluno/AlunoHeader";
import { AlunoMateriaisList } from "@/components/aluno/AlunoMateriaisList";
import { getAlunoDashboard, getMateriaisAluno } from "@/services/alunoService";
import { getAlunoSession } from "@/services/serverSessionService";

export default async function AlunoMateriaisPage() {
  const session = await getAlunoSession();

  if (!session) {
    redirect("/?redirectTo=/aluno/materiais");
  }

  const [aluno, materiaisResponse] = await Promise.all([
    getAlunoDashboard(),
    getMateriaisAluno(),
  ]);

  return (
    <main className="min-h-screen bg-white px-4 py-6 font-poppins text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-y-10">
        <AlunoHeader aluno={aluno} />

        <section
          aria-labelledby="materiais-heading"
          className="flex flex-col gap-y-6"
        >
          <h2
            id="materiais-heading"
            className="font-semibold text-sm tracking-[0.45em]"
          >
            Meus materiais
          </h2>

          <AlunoMateriaisList materiais={materiaisResponse.materiais} />
        </section>
      </div>
    </main>
  );
}
