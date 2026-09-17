type CoordinatorStatusBadgeTone =
  | "black"
  | "green"
  | "greenSoft"
  | "greenStrong"
  | "amber"
  | "orange"
  | "red"
  | "blue"
  | "slate";

interface CoordinatorStatusBadgeProps {
  label: string;
  tone?: CoordinatorStatusBadgeTone;
}

const TONE_STYLES: Record<CoordinatorStatusBadgeTone, string> = {
  black: "border-slate-900 bg-slate-900 text-white",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  greenSoft: "border-emerald-200 bg-emerald-50 text-emerald-700",
  greenStrong: "border-emerald-600 bg-emerald-600 text-white",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  orange: "border-orange-200 bg-orange-50 text-orange-800",
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
      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-1 font-medium text-[0.7rem] ${TONE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
};
