const CERTIFICATE_CARDS = ["eligible", "pending", "issued", "ineligible"];
const CERTIFICATE_ROWS = ["certificate-1", "certificate-2", "certificate-3"];

export default function CoordinatorCertificatesLoading() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando certificados</span>
      <header className="space-y-2">
        <div className="h-7 w-40 rounded bg-slate-200" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CERTIFICATE_CARDS.map((card) => (
          <div key={card} className="h-28 rounded-lg bg-slate-100" />
        ))}
      </section>

      <section className="h-24 rounded-lg border border-slate-200 bg-white" />

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="h-5 w-44 rounded bg-slate-200" />
        <div className="mt-5 space-y-3">
          {CERTIFICATE_ROWS.map((row) => (
            <div key={row} className="h-14 rounded bg-slate-100" />
          ))}
        </div>
      </section>
    </div>
  );
}
