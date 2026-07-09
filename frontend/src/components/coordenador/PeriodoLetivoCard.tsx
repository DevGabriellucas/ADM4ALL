"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarPeriodoLetivoConfigAction } from "@/app/coordenador/actions";
import {
  type PeriodoLetivoFormData,
  periodoLetivoSchema,
} from "@/schemas/configuracionsSchema";

interface PeriodoLetivoCardProps {
  initialData: string;
  onSuccess?: () => void;
}

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:opacity-60";

export const PeriodoLetivoCard = ({
  initialData,
  onSuccess,
}: PeriodoLetivoCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PeriodoLetivoFormData>({
    resolver: zodResolver(periodoLetivoSchema),
    defaultValues: { valor: initialData },
  });

  const onSubmit = async (data: PeriodoLetivoFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const resultado = await atualizarPeriodoLetivoConfigAction(data);
      if (!resultado.sucesso) {
        setErrorMessage(resultado.mensagem);
        return;
      }
      setSuccessMessage(resultado.mensagem);
      onSuccess?.();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar período letivo",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
        Período Letivo Atual
      </h2>
      <p className="mt-1 text-slate-500 text-xs">
        Este período será automaticamente preenchido ao criar novas turmas.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <div className="max-w-xs">
          <Controller
            name="valor"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
                Formato: YYYY.S (ex: 2026.1)
                <input
                  {...field}
                  type="text"
                  placeholder="2026.1"
                  disabled={isSubmitting}
                  className={`${INPUT_CLASS} ${errors.valor ? "border-red-500" : ""}`}
                />
                {errors.valor && (
                  <p className="text-xs text-red-500">
                    {errors.valor.message}
                  </p>
                )}
              </label>
            )}
          />
        </div>

        {successMessage && (
          <div className="mt-4 block rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 enabled:hover:bg-[#292E68] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
};
