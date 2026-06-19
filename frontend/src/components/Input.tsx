import { type ComponentProps, forwardRef } from "react";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, id, ...props }, ref) => {
    const errorId = error && id ? `${id}-error` : undefined;

    return (
      <div className="flex w-full flex-col items-center gap-y-2 px-2">
        {label && (
          <label className="sr-only" htmlFor={id}>
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          className={className}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
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
