import type { ComponentProps } from "react";

interface ButtonProps extends ComponentProps<"button"> {}

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={`h-12 w-full cursor-pointer rounded-lg bg-radial-[at_0%_48.97%] from-[#78A4EA] to-[#445D84] px-4 py-3 font-semibold text-base transition hover:brightness-110 sm:h-[5.22rem] sm:px-10 sm:py-4 sm:text-2xl ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
