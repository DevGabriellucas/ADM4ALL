import { redirect, unstable_rethrow } from "next/navigation";
import { AlunoDashboardActivity } from "@/components/aluno/AlunoDashboardActivity";
import { AlunoDashboardExtras } from "@/components/aluno/AlunoDashboardExtras";
import { AlunoHeader } from "@/components/aluno/AlunoHeader";
import { AlunoMateriaisPanel } from "@/components/aluno/AlunoMateriaisPanel";
import { AlunoMeusDados } from "@/components/aluno/AlunoMeusDados";
import { AlunoStatusPanel } from "@/components/aluno/AlunoStatusPanel";
import { Notificacao } from "@/components/shared/Notificacao";
import {
  FALTAS_TOLERADAS,
  MATRICULA_STATUS,
} from "@/constants/matriculaStatus";
import {
  getAlunoDashboard,
  getMateriaisVisiveisAluno,
} from "@/services/alunoService";
import { getAlunoSession } from "@/services/serverSessionService";

export default async function AlunoDashboardPage() {
  const session = await getAlunoSession();

  if (!session) {
    redirect("/?redirectTo=/aluno/dashboard");
  }

  const [alunoResult, materiaisResult] = await Promise.allSettled([
    getAlunoDashboard(),
    getMateriaisVisiveisAluno(),
  ]);

  if (alunoResult.status === "rejected") {
    throw alunoResult.reason;
  }

  // Falha nos materiais nao derruba o painel: o aluno ainda ve a situacao dele
  // e a lista aparece vazia com aviso. Mas o 401 do apiClient vira redirect(),
  // sinalizado como erro lancado — engolido aqui, uma sessao expirada nesta
  // chamada renderizava a pagina em vez de mandar o aluno para o login.
  if (materiaisResult.status === "rejected") {
    unstable_rethrow(materiaisResult.reason);
  }

  const aluno = alunoResult.value;
  const materiais =
    materiaisResult.status === "fulfilled" ? materiaisResult.value : [];
  const materiaisErro = materiaisResult.status === "rejected";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F6F8FC] font-poppins text-slate-950">
      <div className="flex min-h-screen w-full flex-col gap-y-7">
        {/* Aviso flutuante de 7s, centralizado, como o resto do sistema
            (decisao dele em 18/09). O estado em si nao se perde quando ele
            some: a reprovacao continua no cartao "Status do aluno" e no de
            certificado, que explicam o motivo e ficam na tela. */}
        {aluno.status === MATRICULA_STATUS.REPROVADO_FALTA && (
          <Notificacao tipo="erro">
            Você foi reprovado por falta. O limite máximo permitido é de{" "}
            {FALTAS_TOLERADAS} faltas.
          </Notificacao>
        )}

        {/* A conclusao e comemoracao e o estado dela continua no cartao de
            certificado logo abaixo, entao ela pode passar. O certificado e
            liberado quando todas as aulas terminam e a frequencia minima de
            80% e atingida. */}
        {aluno.certificadoLiberado && (
          <Notificacao tipo="sucesso">
            Parabéns! Você concluiu o curso {aluno.curso} com sucesso.
          </Notificacao>
        )}

        <AlunoHeader aluno={aluno} />

        {/* Aluno cadastrado antes de entrar numa turma e estado normal, nao
            erro: a coordenacao cadastra primeiro e vincula depois. Mostrar os
            paineis zerados diria "0 aulas, 0% de progresso" para quem nem
            comecou. */}
        {aluno.semMatricula ? (
          <section className="px-4 pb-6 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-[#D5DDEC] bg-white p-6 text-center">
              <h2 className="font-semibold text-slate-900 text-lg">
                Você ainda não está vinculado a uma turma
              </h2>
              <p className="mt-2 text-slate-600 text-sm">
                Seu cadastro está ativo. Assim que a coordenação vincular você a
                uma turma, o cronograma, a frequência e os materiais aparecem
                aqui.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section
              aria-labelledby="curso-heading"
              className="flex flex-col gap-y-6 px-4 sm:px-6 lg:px-8"
            >
              <div className="flex flex-col gap-1">
                <p className="font-medium text-blue-700 text-sm">Meu curso</p>
                <h2
                  id="curso-heading"
                  className="font-semibold text-2xl text-slate-950 tracking-tight"
                >
                  {aluno.curso}
                </h2>
              </div>

              <AlunoStatusPanel aluno={aluno} />
            </section>

            <div className="px-4 sm:px-6 lg:px-8">
              <AlunoDashboardExtras aluno={aluno} />
            </div>

            <div className="px-4 sm:px-6 lg:px-8">
              <AlunoDashboardActivity aluno={aluno} />
            </div>

            <div className="px-4 sm:px-6 lg:px-8">
              <AlunoMateriaisPanel
                materiais={materiais}
                erroCarregamento={materiaisErro}
              />
            </div>

            <div className="px-4 pb-6 sm:px-6 lg:px-8">
              <AlunoMeusDados />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
