import Image from "next/image";

interface AuthBrandPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
}

export const AuthBrandPanel = ({
  eyebrow,
  title,
  description,
  compact = false,
}: AuthBrandPanelProps) => (
  <section className="flex w-full max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
    <div className="mb-8 flex items-center gap-3 self-center lg:self-start">
      <span className="flex size-10 items-center justify-center rounded-xl bg-white font-bold text-brand-dark shadow-sm">
        A+
      </span>
      <span className="font-semibold text-sm text-white tracking-[0.18em]">
        ADM PARA TODOS
      </span>
    </div>
    <p className="mb-3 font-semibold text-white text-xs uppercase tracking-[0.28em]">
      {eyebrow}
    </p>
    <h1 className="max-w-lg font-semibold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
      {title}
    </h1>
    <p className="mt-5 max-w-md text-base text-white leading-7">
      {description}
    </p>
    <div
      className={`relative mt-8 w-full ${compact ? "max-w-sm" : "max-w-lg"}`}
    >
      <div className="rounded-2xl bg-white/95 p-4 shadow-2xl">
        <Image
          src="/administracao-para-todos.png"
          alt="Logo do projeto de extensão Administração para Todos"
          width={980}
          height={571}
          priority
          className="w-full object-contain"
        />
      </div>
    </div>
    <p className="mt-6 text-center text-white/85 text-xs lg:text-left">
      Projeto de extensão universitária • Formação e cidadania
    </p>
  </section>
);
