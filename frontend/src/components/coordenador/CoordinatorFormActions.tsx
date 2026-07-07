interface CoordinatorFormActionsProps {
  submitLabel: string;
  onCancel: () => void;
  disabled?: boolean;
}

export const CoordinatorFormActions = ({
  submitLabel,
  onCancel,
  disabled,
}: CoordinatorFormActionsProps) => {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={disabled}
        className="h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="h-11 cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 enabled:hover:bg-[#292E68] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </div>
  );
};
