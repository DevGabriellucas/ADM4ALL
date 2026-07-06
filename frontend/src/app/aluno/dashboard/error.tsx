"use client";

interface AlunoDashboardErrorProps {
  error: Error;
  reset: () => void;
}

export default function AlunoDashboardError({
  error,
  reset,
}: AlunoDashboardErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 font-poppins">
      <section
        role="alert"
        className="w-full max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center"
      >
        <h1 className="font-semibold text-red-900 text-xl">
          Nao foi possivel carregar o painel
        </h1>
        <p className="mt-3 text-red-800 text-sm">
          {error.message || "Verifique sua conexao ou entre novamente."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-brand-medium px-4 py-2 font-semibold text-sm"
          >
            Tentar novamente
          </button>
          <a
            href="/logout"
            className="rounded-md border border-red-300 px-4 py-2 font-semibold text-red-900 text-sm"
          >
            Voltar ao login
          </a>
        </div>
      </section>
    </main>
  );
}
