type CoordinatorStatusBadgeTone = "green" | "amber" | "red" | "blue" | "slate";

interface CoordinatorStatusBadgeProps {
  label: string;
  tone?: CoordinatorStatusBadgeTone;
}

const TONE_STYLES: Record<CoordinatorStatusBadgeTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export const CoordinatorStatusBadge = ({
  label,
  tone = "slate",
}: CoordinatorStatusBadgeProps) => {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-medium text-[0.7rem] ${TONE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
};
