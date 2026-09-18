interface CoordinatorStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "neutral" | "blue" | "green" | "amber" | "red";
}

const VARIANT_STYLES = {
  neutral: "border-[#8D9DB4] bg-[#E7ECF8]",
  blue: "border-[#8AA6E0] bg-[#DCE7FB]",
  green: "border-[#86C99B] bg-[#DDF3E4]",
  amber: "border-[#E0B583] bg-[#F8E7D2]",
  // Mesma familia de tom das outras: borda saturada sobre fundo claro.
  red: "border-[#DE9A9A] bg-[#FADEDE]",
} as const;

export const CoordinatorStatCard = ({
  title,
  value,
  subtitle,
  variant = "neutral",
}: CoordinatorStatCardProps) => {
  return (
    <article
      className={`flex min-h-28 flex-col justify-between rounded-lg border px-4 py-3 shadow-sm ${VARIANT_STYLES[variant]}`}
    >
      <p className="font-medium text-slate-700 text-xs leading-tight">
        {title}
      </p>

      <div>
        <p className="font-semibold text-3xl text-slate-900">{value}</p>
        {subtitle && (
          <p className="mt-1 text-[0.72rem] text-slate-600">{subtitle}</p>
        )}
      </div>
    </article>
  );
};
