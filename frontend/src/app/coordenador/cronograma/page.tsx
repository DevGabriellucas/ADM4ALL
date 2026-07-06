import Link from "next/link";
import { BackButton } from "@/components/shared/BackButton";

export default function CoordinatorSchedulePage() {
  return (
    <>
      <BackButton className="mb-4" />
      <section className="flex flex-col items-center justify-center rounded-lg border border-[#D5DDEC] bg-white px-6 py-16 text-center shadow-sm">
        <h1 className="font-semibold text-xl text-slate-950">
          Funcionalidade em desenvolvimento
        </h1>
        <p className="mt-3 max-w-lg text-slate-600 text-sm leading-relaxed">
          O cronograma de aulas será integrado quando o fluxo real de aulas
          estiver disponível.
        </p>
        <Link
          href="/coordenador/dashboard"
          className="mt-6 inline-flex cursor-pointer items-center gap-x-2 rounded-lg bg-brand-dark px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-[#23275F]"
        >
          Voltar ao dashboard
        </Link>
      </section>
    </>
  );
}
