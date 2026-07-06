"use client";

interface CoordinatorRouteErrorProps {
  title: string;
  description?: string;
  error?: Error;
  reset: () => void;
}

const mensagemAmigavel = (error?: Error, description?: string) => {
  if (error?.message) {
    return error.message;
  }

  return (
    description ??
    "Não conseguimos carregar estes dados agora. Verifique a conexão com a API e tente novamente."
  );
};

export const CoordinatorRouteError = ({
  title,
  description,
  error,
  reset,
}: CoordinatorRouteErrorProps) => {
  return (
    <section
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm"
    >
      <h1 className="font-semibold text-red-900 text-xl">{title}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-red-800 text-sm leading-6">
        {mensagemAmigavel(error, description)}
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
};
