"use client";

interface ResendActivationConfirmModalProps {
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResendActivationConfirmModal = ({
  isLoading,
  onCancel,
  onConfirm,
}: ResendActivationConfirmModalProps) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resend-activation-title"
      aria-describedby="resend-activation-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2
          id="resend-activation-title"
          className="font-semibold text-slate-950 text-xl"
        >
          Reenviar ativação?
        </h2>
        <p
          id="resend-activation-description"
          className="mt-3 text-slate-600 text-sm"
        >
          O link anterior será invalidado e um novo e-mail de ativação será
          enviado para este aluno.
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
            {isLoading ? "Reenviando..." : "Reenviar ativação"}
          </button>
        </div>
      </div>
    </div>
  );
};
