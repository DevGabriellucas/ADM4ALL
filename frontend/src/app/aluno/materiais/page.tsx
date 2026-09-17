import { redirect, unstable_rethrow } from "next/navigation";
import { AlunoHeader } from "@/components/aluno/AlunoHeader";
import { AlunoMateriaisPanel } from "@/components/aluno/AlunoMateriaisPanel";
import { BackButton } from "@/components/shared/BackButton";
import {
  getAlunoDashboard,
  getMateriaisVisiveisAluno,
} from "@/services/alunoService";
import { getAlunoSession } from "@/services/serverSessionService";

export default async function AlunoMateriaisPage() {
  const session = await getAlunoSession();

  if (!session) {
    redirect("/?redirectTo=/aluno/materiais");
  }

  const [alunoResult, materiaisResult] = await Promise.allSettled([
    getAlunoDashboard(),
    getMateriaisVisiveisAluno(),
  ]);

  if (alunoResult.status === "rejected") {
    throw alunoResult.reason;
  }

  // O 401 do apiClient vira redirect(), sinalizado como erro lancado. Engolido
  // aqui, ele deixava a tela renderizar sem material nenhum em vez de mandar o
  // aluno para o login.
  if (materiaisResult.status === "rejected") {
    unstable_rethrow(materiaisResult.reason);
  }

  const aluno = alunoResult.value;
  const materiais =
    materiaisResult.status === "fulfilled" ? materiaisResult.value : [];

  return (
    <main className="min-h-screen bg-white px-4 py-6 font-poppins text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-y-10">
        <AlunoHeader aluno={aluno} />

        <section
          aria-labelledby="materiais-heading"
          className="flex flex-col gap-y-6"
        >
          <div className="flex flex-col gap-y-4">
            <BackButton />
            <h2
              id="materiais-heading"
              className="font-semibold text-sm tracking-[0.45em]"
            >
              Meus materiais
            </h2>
          </div>

          <AlunoMateriaisPanel
            materiais={materiais}
            erroCarregamento={materiaisResult.status === "rejected"}
          />
        </section>
      </div>
    </main>
  );
}
