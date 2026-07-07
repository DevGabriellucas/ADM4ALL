const INSTRUCTOR_DETAIL_BLOCKS = [
  "header",
  "contact",
  "professional",
  "classes",
] as const;

export default function CoordinatorInstructorDetailLoading() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando instrutor</span>

      {INSTRUCTOR_DETAIL_BLOCKS.map((block) => (
        <section
          key={block}
          className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
        >
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-80 max-w-full rounded bg-slate-100" />
          <div className="mt-6 h-20 rounded bg-slate-50" />
        </section>
      ))}
    </div>
  );
}
