type MetricVariant = "neutral" | "verde" | "azul" | "ambar";

interface MetricCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: MetricVariant;
}

const VARIANT_STYLES: Record<MetricVariant, string> = {
  neutral: "bg-[#E7ECF8] border-[#8D9DB4]",
  verde: "bg-[#DDF3E4] border-[#86C99B]",
  azul: "bg-[#DCE7FB] border-[#8AA6E0]",
  ambar: "bg-[#F8E7D2] border-[#E0B583]",
};

export const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
  variant = "neutral",
}: MetricCardProps) => {
  return (
    <article
      className={`flex min-h-24 flex-col justify-between rounded-lg border px-4 py-3 shadow-sm ${VARIANT_STYLES[variant]}`}
    >
      <div className="flex items-center justify-between gap-x-2">
        <p className="font-medium text-slate-700 text-xs leading-tight">
          {title}
        </p>
        <span aria-hidden className="text-lg">
          {icon}
        </span>
      </div>

      <div>
        <p className="font-semibold text-2xl text-slate-900">{value}</p>
        {subtitle && (
          <p className="mt-0.5 text-[0.7rem] text-slate-600">{subtitle}</p>
        )}
      </div>
    </article>
  );
};
