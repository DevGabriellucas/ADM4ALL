"use client";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "neutral";
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const CONFIRM_BUTTON_CLASS = {
  danger: "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-amber-600 text-white hover:bg-amber-700",
  neutral: "bg-brand-dark text-white hover:bg-navy-900",
} as const;

export const ConfirmDialog = ({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "neutral",
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2
          id="confirm-dialog-title"
          className="font-semibold text-slate-950 text-xl"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="mt-3 text-slate-600 text-sm leading-6"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-lg border border-slate-300 px-4 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`h-10 cursor-pointer rounded-lg px-4 font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${CONFIRM_BUTTON_CLASS[tone]}`}
          >
            {isLoading ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
