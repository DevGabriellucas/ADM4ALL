import type { ReactNode } from "react";

interface CoordinatorPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export const CoordinatorPageHeader = ({
  title,
  subtitle,
  action,
}: CoordinatorPageHeaderProps) => {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-semibold text-2xl text-slate-950">{title}</h1>
        <p className="mt-1 text-slate-600 text-sm">{subtitle}</p>
      </div>
      {action}
    </header>
  );
};
