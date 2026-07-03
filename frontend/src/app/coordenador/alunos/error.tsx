"use client";

interface CoordinatorStudentsErrorProps {
  reset: () => void;
}

export default function CoordinatorStudentsError({
  reset,
}: CoordinatorStudentsErrorProps) {
  return (
    <section
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm"
    >
      <h1 className="font-semibold text-red-900 text-xl">
        Não foi possível carregar os alunos
      </h1>
      <p className="mt-2 text-red-800 text-sm">
        Tente novamente em alguns instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-lg bg-brand-dark px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
      >
        Tentar novamente
      </button>
    </section>
  );
}
