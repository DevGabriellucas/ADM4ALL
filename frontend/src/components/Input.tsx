import { type ComponentProps, forwardRef } from "react";

interface InputProps extends ComponentProps<"input"> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-y-2">
        <input ref={ref} className={className} {...props} />

        {error && (
          <span className="px-1.5 font-medium text-red-700 text-sm">
            {error}
          </span>
        )}
      </div>
    );
  },
);
