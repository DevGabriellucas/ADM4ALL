export default function InstrutorLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDF1FB] px-4">
      <div className="w-full max-w-md rounded-lg border border-[#D5DDEC] bg-white p-6 text-center shadow-sm">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-brand-light border-t-brand-dark" />
        <p className="mt-4 font-semibold text-slate-900 text-sm">
          Carregando area do instrutor...
        </p>
      </div>
    </div>
  );
}
