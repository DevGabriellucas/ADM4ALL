import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";

export default function CoordenadorPage() {
  return (
    <CoordinatorLayout>
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
            Gestão
          </p>
          <p className="mt-1 font-medium text-sm sm:text-base">
            Coordenador/Admin
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-[#D5DDEC] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-y-3">
          <p className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
            Painel do Coordenador
          </p>
          <p className="max-w-3xl text-slate-600 text-sm leading-6">
            Esta área será usada para acompanhar cursos, turmas, alunos,
            instrutores, frequência, cronograma, certificados, relatórios,
            processos e usuários.
          </p>
        </div>
      </section>
    </CoordinatorLayout>
  );
}
