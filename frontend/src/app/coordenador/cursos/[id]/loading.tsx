export default function CoordinatorCourseDetailLoading() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando detalhes do curso</span>

      <div className="h-9 w-24 rounded bg-slate-200" />

      <section className="rounded-lg border border-[#D5DDEC] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="h-7 w-64 rounded bg-slate-200" />
            <div className="h-4 w-96 max-w-full rounded bg-slate-100" />
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-200" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-20 rounded-lg bg-slate-100" />
          <div className="h-20 rounded-lg bg-slate-100" />
          <div className="h-20 rounded-lg bg-slate-100" />
        </div>
      </section>
    </div>
  );
}
