const STUDENT_DETAIL_ROWS = ["matricula-1", "matricula-2"] as const;

export default function CoordinatorStudentDetailLoading() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando detalhes do aluno</span>

      <header className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <div className="h-3 w-28 rounded bg-slate-100" />
        <div className="mt-5 h-7 w-64 max-w-full rounded bg-slate-200" />
        <div className="mt-3 h-4 w-48 max-w-full rounded bg-slate-100" />
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-lg bg-slate-100" />
        <div className="h-64 rounded-lg bg-slate-100" />
      </section>

      <section className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="mt-6 space-y-4">
          {STUDENT_DETAIL_ROWS.map((row) => (
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
