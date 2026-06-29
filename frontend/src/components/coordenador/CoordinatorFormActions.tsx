interface CoordinatorFormActionsProps {
  submitLabel: string;
  onCancel: () => void;
}

export const CoordinatorFormActions = ({
  submitLabel,
  onCancel,
}: CoordinatorFormActionsProps) => {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="h-11 rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
      >
        {submitLabel}
      </button>
    </div>
  );
};
