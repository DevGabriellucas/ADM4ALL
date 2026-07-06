"use client";

interface AlunoMateriaisErrorProps {
  reset: () => void;
}

export default function AlunoMateriaisError({
  reset,
}: AlunoMateriaisErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 font-poppins">
      <section
        role="alert"
        className="w-full max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center"
      >
        <h1 className="font-semibold text-red-900 text-xl">
          Não foi possível carregar os materiais
        </h1>
        <p className="mt-3 text-red-800 text-sm">
          Verifique sua conexão ou entre novamente.
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
            href="/"
            className="rounded-md border border-red-300 px-4 py-2 font-semibold text-red-900 text-sm"
          >
            Voltar ao login
          </a>
        </div>
      </section>
    </main>
  );
}
