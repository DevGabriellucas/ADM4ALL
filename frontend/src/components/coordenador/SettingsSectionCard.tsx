import type { ReactNode } from "react";

interface SettingsSectionCardProps {
  children: ReactNode;
  className?: string;
  description?: string;
  eyebrow: string;
  title: string;
}

const fieldBaseClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export const getSettingsFieldClass = (hasError?: boolean) =>
  `${fieldBaseClass} ${
    hasError ? "border-red-500 focus:border-red-600 focus:ring-red-100" : ""
  }`;

export const settingsLabelClass =
  "mb-1.5 block font-medium text-slate-700 text-xs";

export const settingsErrorClass = "mt-1 text-red-700 text-xs";

export const settingsSubmitButtonClass =
  "h-10 cursor-pointer rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const SettingsSectionCard = ({
  children,
  className = "",
  description,
  eyebrow,
  title,
}: SettingsSectionCardProps) => {
  return (
    <section
      className={`rounded-lg border border-[#D5DDEC] bg-white shadow-sm ${className}`}
    >
      <header className="border-[#D5DDEC] border-b px-5 py-4">
        <p className="font-semibold text-brand-dark text-xs tracking-[0.18em]">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-semibold text-base text-slate-950">{title}</h2>
        {description && (
          <p className="mt-1 max-w-2xl text-slate-500 text-sm">{description}</p>
        )}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
};
