const STUDENT_CARD_SKELETONS = [
  "total",
  "ativos",
  "pendentes",
  "frequencia",
] as const;

const STUDENT_ROW_SKELETONS = ["aluno-1", "aluno-2", "aluno-3"] as const;

export default function CoordinatorStudentsLoading() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando alunos</span>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-28 rounded bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
        </div>
        <div className="h-11 w-full rounded-lg bg-slate-200 sm:w-36" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STUDENT_CARD_SKELETONS.map((card) => (
          <div key={card} className="h-28 rounded-lg bg-slate-100" />
        ))}
      </section>

      <section className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-72 max-w-full rounded bg-slate-100" />

        <div className="mt-6 space-y-4">
          {STUDENT_ROW_SKELETONS.map((row) => (
            <div
              key={row}
              className="h-14 rounded border border-slate-100 bg-slate-50"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
