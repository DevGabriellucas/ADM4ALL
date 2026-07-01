const CLASS_DETAIL_CARD_SKELETONS = [
  "alunos",
  "frequencia",
  "aulas",
  "certificados",
] as const;

export default function CoordinatorClassDetailsLoading() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando detalhes da turma</span>

      <header className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <div className="h-3 w-28 rounded bg-slate-100" />
        <div className="mt-5 h-7 w-64 max-w-full rounded bg-slate-200" />
        <div className="mt-3 h-4 w-48 max-w-full rounded bg-slate-100" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CLASS_DETAIL_CARD_SKELETONS.map((card) => (
          <div key={card} className="h-28 rounded-lg bg-slate-100" />
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-[#D5DDEC] bg-white shadow-sm">
        <div className="flex gap-4 border-slate-200 border-b bg-slate-50 p-4">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
        </div>
        <div className="space-y-4 p-5">
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="h-14 rounded border border-slate-100 bg-slate-50" />
          <div className="h-14 rounded border border-slate-100 bg-slate-50" />
          <div className="h-14 rounded border border-slate-100 bg-slate-50" />
        </div>
      </section>
    </div>
  );
}
