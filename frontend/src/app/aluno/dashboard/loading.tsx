export default function AlunoDashboardLoading() {
  const cards = ["faltas", "progresso", "aulas", "status"];

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-4 py-5 font-poppins text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-7">
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-48 rounded-2xl bg-slate-200 sm:col-span-2 lg:col-span-4" />
          {cards.map((card) => (
            <div key={card} className="h-28 rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
