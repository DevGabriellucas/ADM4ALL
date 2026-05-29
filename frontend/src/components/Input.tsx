import { type ComponentProps, forwardRef } from "react";

interface InputProps extends ComponentProps<"input"> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-y-2">
        <input ref={ref} className={`h-[5.22rem] w-full rounded-lg bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] px-10 py-4 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-xl" ${className}`} {...props} />

        {error && (
          <span className="px-1.5 font-medium text-red-700 text-sm">
            {error}
          </span>
        )}
      </div>
    );
  },
);
