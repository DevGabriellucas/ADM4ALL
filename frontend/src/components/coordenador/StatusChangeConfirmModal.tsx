"use client";

interface StatusChangeConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const StatusChangeConfirmModal = ({
  title,
  description,
  confirmLabel,
  isLoading,
  onCancel,
  onConfirm,
}: StatusChangeConfirmModalProps) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-change-title"
      aria-describedby="status-change-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2
          id="status-change-title"
          className="font-semibold text-slate-950 text-xl"
        >
          {title}
        </h2>
        <p
          id="status-change-description"
          className="mt-3 text-slate-600 text-sm"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="h-10 rounded-lg border border-slate-300 px-4 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="h-10 rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Salvando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
