interface AlunoInfoCardProps {
  title: string;
  value: string | number;
  isWarning?: boolean;
}

export const AlunoInfoCard = ({
  title,
  value,
  isWarning = false,
}: AlunoInfoCardProps) => {
  return (
    <article className="flex min-h-16 w-full flex-col justify-center text-left">
      <p
        className={`font-medium text-sm ${
          isWarning ? "text-red-700" : "text-slate-900"
        }`}
      >
        <span className="block text-slate-500">{title}</span>
        <strong className="mt-1 block font-semibold text-xl">{value}</strong>
      </p>
    </article>
  );
};
