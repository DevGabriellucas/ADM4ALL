import type { ComponentProps } from "react";

interface ButtonProps extends ComponentProps<"button"> {}

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={`h-[5.22rem] w-full cursor-pointer rounded-lg bg-radial-[at_0%_48.97%] from-[#78A4EA] to-[#445D84] px-10 py-4 font-semibold text-2xl hover:brightness-110 transition
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
