interface AlunoInfoCardProps {
  title: string;
  value: string | number;
  isWarning?: boolean;
  helperText?: string;
}

export const AlunoInfoCard = ({
  title,
  value,
  isWarning = false,
  helperText,
}: AlunoInfoCardProps) => {
  return (
    <article className="flex min-h-24 w-full flex-col items-center justify-center border border-[#8D9DB4] bg-[#C9D8EF] px-5 py-4 text-center shadow-sm md:min-h-20">
      <p
        className={`font-medium text-sm tracking-[0.35em] ${
          isWarning ? "text-red-700" : "text-slate-900"
        }`}
      >
        {title}: {value}
      </p>

      {helperText && (
        <p className="mt-2 font-semibold text-[0.7rem] text-red-800 tracking-[0.18em]">
          {helperText}
        </p>
      )}
    </article>
  );
};
