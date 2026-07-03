const INSTRUCTOR_CARD_SKELETONS = [
  "total",
  "ativos",
  "convites",
  "turmas",
] as const;

const INSTRUCTOR_ROW_SKELETONS = [
  "instrutor-1",
  "instrutor-2",
  "instrutor-3",
] as const;

export default function CoordinatorInstructorsLoading() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando instrutores</span>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
        </div>
        <div className="h-11 w-full rounded-lg bg-slate-200 sm:w-40" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INSTRUCTOR_CARD_SKELETONS.map((card) => (
          <div key={card} className="h-28 rounded-lg bg-slate-100" />
        ))}
      </section>

      <section className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <div className="h-5 w-56 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-80 max-w-full rounded bg-slate-100" />

        <div className="mt-6 space-y-4">
          {INSTRUCTOR_ROW_SKELETONS.map((row) => (
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
