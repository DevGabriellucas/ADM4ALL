interface DashboardInfoCardProps {
  title: string;
  value: string | number;
  description: string;
}

export const DashboardInfoCard = ({
  title,
  value,
  description,
}: DashboardInfoCardProps) => {
  return (
    <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
      <p className="font-semibold text-slate-900 text-sm tracking-[0.18em]">
        {title}
      </p>
      <p className="mt-4 font-semibold text-3xl text-brand-dark">{value}</p>
      <p className="mt-2 text-slate-500 text-xs leading-5">{description}</p>
    </article>
  );
};
