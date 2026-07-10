import { type ComponentProps, forwardRef } from "react";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, id, ...props }, ref) => {
    const errorId = error && id ? `${id}-error` : undefined;

    return (
      <div className="flex flex-col gap-y-2">
        <input
          ref={ref}
          id={id}
          className={`h-12 w-full rounded-lg bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] px-4 py-3 text-base opacity-60 outline-none placeholder:font-normal placeholder:text-base autofill:shadow-[0_0_0_1000px_#BFD0EC_inset] sm:h-[5.22rem] sm:px-10 sm:py-4 sm:text-xl sm:placeholder:text-xl autofill:[-webkit-text-fill-color:#334155] ${className}`}
          {...props}
        />
        {error && (
          <span
            className="px-1.5 font-medium text-red-700 text-sm"
            id={errorId}
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);
