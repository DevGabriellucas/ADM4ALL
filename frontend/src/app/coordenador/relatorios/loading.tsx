const REPORT_CARDS = [
  "geral",
  "frequencia",
  "aprovados",
  "reprovados",
] as const;
const REPORT_ROWS = ["relatorio-1", "relatorio-2", "relatorio-3"] as const;

export default function CoordinatorReportsLoading() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando relatórios</span>

      <header className="space-y-2">
        <div className="h-7 w-32 rounded bg-slate-200" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REPORT_CARDS.map((card) => (
          <div key={card} className="h-28 rounded-lg bg-slate-100" />
        ))}
      </section>

      <section className="h-24 rounded-lg border border-slate-200 bg-white" />

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="mt-5 space-y-3">
          {REPORT_ROWS.map((row) => (
            <div key={row} className="h-14 rounded bg-slate-100" />
          ))}
        </div>
      </section>
    </div>
  );
}
