export default function CoordinatorDashboardLoading() {
  return (
    <section
      aria-busy="true"
      className="flex flex-col gap-y-8"
    >
      <span className="sr-only">Carregando dashboard do coordenador...</span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-20 animate-pulse rounded-lg bg-brand-medium/40" />
        <div className="h-20 animate-pulse rounded-lg bg-brand-light/40" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["alunos", "turmas", "frequencia", "certificados"].map((id) => (
          <div
            key={`stat-skeleton-${id}`}
            className="h-24 animate-pulse rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
          >
            <div className="mb-2 h-3 w-20 rounded bg-slate-200" />
            <div className="h-5 w-12 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="h-64 animate-pulse rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <div className="mb-4 h-4 w-32 rounded bg-slate-200" />
        <div className="flex flex-col gap-y-3">
          {["a1", "a2", "a3", "a4", "a5"].map((id) => (
            <div
              key={`attention-skeleton-${id}`}
              className="h-10 w-full rounded bg-slate-100"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-28 animate-pulse rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <div className="mb-2 h-3 w-28 rounded bg-slate-200" />
          <div className="h-5 w-8 rounded bg-slate-200" />
        </div>
        <div className="h-28 animate-pulse rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <div className="mb-2 h-3 w-32 rounded bg-slate-200" />
          <div className="h-5 w-full rounded bg-slate-200" />
        </div>
      </div>
    </section>
  );
}
