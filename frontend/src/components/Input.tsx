import { type ComponentProps, forwardRef, useId } from "react";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
  /** Texto de apoio abaixo do campo, quando nao ha erro. */
  hint?: string;
}

// Campo dos formularios de acesso.
//
// A `label` chegava aqui e era descartada: os campos ficavam so com
// placeholder, que some quando a pessoa comeca a digitar e nao e anunciado de
// forma confiavel por leitor de tela. O `aria-describedby` do erro tambem era
// montado e nunca ligado ao input.
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, hint, className, id, ...props }, ref) => {
    const idGerado = useId();
    const inputId = id ?? idGerado;
    const errorId = `${inputId}-erro`;
    const hintId = `${inputId}-ajuda`;
    const descricao = error ? errorId : hint ? hintId : undefined;

    return (
      <div className="flex flex-col gap-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-medium text-[0.8125rem] text-slate-700"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={descricao}
          className={`h-11 w-full rounded-lg border bg-white px-3.5 text-[0.9375rem] text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
              : "border-line focus:border-azure-600 focus:ring-4 focus:ring-azure-600/15"
          } ${className ?? ""}`}
          {...props}
        />

        {error ? (
          <span
            id={errorId}
            role="alert"
            className="font-medium text-[0.75rem] text-red-700"
          >
            {error}
          </span>
        ) : (
          hint && (
            <span id={hintId} className="text-[0.75rem] text-slate-500">
              {hint}
            </span>
          )
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
