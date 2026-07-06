"use client";

interface InstrutorErrorProps {
  error: Error;
  reset: () => void;
}

export default function InstrutorError({ error, reset }: InstrutorErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDF1FB] px-4">
      <div className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950 text-lg">
          Nao foi possivel carregar a area do instrutor
        </h2>
        <p className="mt-2 text-red-700 text-sm">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-brand-dark px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-brand-medium"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
