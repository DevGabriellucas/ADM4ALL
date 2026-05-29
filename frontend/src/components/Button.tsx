import type { ComponentProps } from "react";

interface ButtonProps extends ComponentProps<"button"> {}

export const Button = ({ children, className ,...props }: ButtonProps) => {
  return (
    <button
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}