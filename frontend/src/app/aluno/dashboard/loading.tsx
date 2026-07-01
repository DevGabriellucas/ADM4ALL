export default function AlunoDashboardLoading() {
  const cards = ["faltas", "progresso", "aulas", "status"];

  return (
    <main className="min-h-screen bg-white px-4 py-6 font-poppins text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl animate-pulse space-y-10">
        <div className="h-28 rounded bg-[#C9D8EF]" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {cards.map((card) => (
            <div key={card} className="h-24 rounded bg-[#F1F4FC]" />
          ))}
        </div>
      </div>
    </main>
  );
}
