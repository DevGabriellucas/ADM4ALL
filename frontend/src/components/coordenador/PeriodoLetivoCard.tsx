"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarPeriodoLetivoConfigAction } from "@/app/coordenador/actions";
import {
  getSettingsFieldClass,
  SettingsSectionCard,
  settingsErrorClass,
  settingsLabelClass,
  settingsSubmitButtonClass,
} from "@/components/coordenador/SettingsSectionCard";
import {
  type PeriodoLetivoFormData,
  periodoLetivoSchema,
} from "@/schemas/configuracionsSchema";

interface PeriodoLetivoCardProps {
  className?: string;
  initialData: string;
  onSuccess?: () => Promise<void> | void;
}

export const PeriodoLetivoCard = ({
  className,
  initialData,
  onSuccess,
}: PeriodoLetivoCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PeriodoLetivoFormData>({
    resolver: zodResolver(periodoLetivoSchema),
    defaultValues: { valor: initialData },
  });

  useEffect(() => {
    reset({ valor: initialData });
  }, [initialData, reset]);

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
      await onSuccess?.();
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
    <SettingsSectionCard
      className={className}
      eyebrow="Calendário"
      title="Período letivo"
      description="Valor aplicado em novas turmas e indicadores acadêmicos."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="valor"
          control={control}
          render={({ field }) => (
            <div>
              <label htmlFor="school-period" className={settingsLabelClass}>
                Formato
              </label>
              <input
                {...field}
                id="school-period"
                type="text"
                placeholder="2026.1"
                disabled={isSubmitting}
                className={getSettingsFieldClass(Boolean(errors.valor))}
              />
              <p className="mt-1 text-slate-500 text-xs">
                Use o padrão YYYY.S, como 2026.1 ou 2026.2.
              </p>
              {errors.valor && (
                <p className={settingsErrorClass}>{errors.valor.message}</p>
              )}
            </div>
          )}
        />

        {successMessage && (
          <output
            aria-live="polite"
            className="block rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-800 text-sm"
          >
            {successMessage}
          </output>
        )}

        {errorMessage && (
          <output
            aria-live="polite"
            className="block rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800 text-sm"
          >
            {errorMessage}
          </output>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={settingsSubmitButtonClass}
          >
            {isSubmitting ? "Salvando..." : "Salvar período"}
          </button>
        </div>
      </form>
    </SettingsSectionCard>
  );
};
