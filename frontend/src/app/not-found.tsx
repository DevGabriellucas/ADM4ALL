import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EDF1FB] px-4 py-10 font-poppins text-slate-950 sm:px-6">
      <section className="w-full max-w-xl rounded-lg border border-[#D5DDEC] bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
        <p className="font-semibold text-brand-medium text-sm uppercase tracking-[0.25em]">
          ADM4All
        </p>
        <p className="mt-5 font-semibold text-7xl text-brand-dark sm:text-8xl">
          404
        </p>
        <h1 className="mt-5 font-semibold text-2xl text-slate-950 sm:text-3xl">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600 text-sm leading-6 sm:text-base">
          A página que você está tentando acessar não existe ou foi movida.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-dark px-6 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
        >
          Voltar para o início
        </Link>
      </section>
    </main>
  );
}
