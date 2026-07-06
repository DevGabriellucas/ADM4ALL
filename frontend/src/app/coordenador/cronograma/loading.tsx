export default function CoordinatorScheduleLoading() {
  return (
    <div className="rounded-lg border border-[#D5DDEC] bg-white p-6 shadow-sm">
      <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["1", "2", "3", "4"].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded bg-slate-100" />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded bg-slate-100" />
    </div>
  );
}
