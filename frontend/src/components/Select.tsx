import type { ComponentProps } from "react";

interface SelectProps extends ComponentProps <"select"> {}

export const Select = ({children, className, ... props}: SelectProps) => {
    return (
        <select
            className={`h-[5.22rem] w-full max-w-full overflow-hidden cursor-pointer rounded-lg bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] px-10 py-4 text-base outline-none placeholder:font-normal placeholder:text-2xl"
                ${className}`}
            {...props}
        >
            {children}
        </select>
    )
}