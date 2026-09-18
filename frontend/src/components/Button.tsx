import type { ComponentProps } from "react";

type Variante = "primario" | "secundario";

interface ButtonProps extends ComponentProps<"button"> {
  variante?: Variante;
}

// O azul vivo e a fatia de 10% da paleta: ele aparece no botao principal, no
// link e no anel de foco, e em mais nada. E o que faz a acao principal de cada
// tela ser encontrada sem precisar de tamanho exagerado.
const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-azure-600 text-white hover:bg-azure-700 active:bg-azure-700 disabled:bg-slate-300 disabled:text-slate-500",
  secundario:
    "border border-line bg-white text-navy-800 hover:border-azure-500 hover:text-azure-700 disabled:text-slate-400",
};

export const Button = ({
  children,
  className,
  variante = "primario",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-lg px-5 font-semibold text-[0.9375rem] transition-colors focus-visible:outline-2 focus-visible:outline-azure-600 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${VARIANTES[variante]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
};
