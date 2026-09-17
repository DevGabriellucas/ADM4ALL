"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarCertificadoAction } from "@/app/coordenador/actions";
import {
  getSettingsFieldClass,
  SettingsSectionCard,
  settingsErrorClass,
  settingsLabelClass,
  settingsSubmitButtonClass,
} from "@/components/coordenador/SettingsSectionCard";
import { Notificacao } from "@/components/shared/Notificacao";
import {
  type CertificadoFormData,
  certificadoSchema,
} from "@/schemas/configuracionsSchema";

interface CertificadoCardProps {
  className?: string;
  initialData: CertificadoFormData;
  onSuccess?: () => Promise<void> | void;
}

export const CertificadoCard = ({
  className,
  initialData,
  onSuccess,
}: CertificadoCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CertificadoFormData>({
    resolver: zodResolver(certificadoSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = async (data: CertificadoFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const resultado = await atualizarCertificadoAction(data);
      if (!resultado.sucesso) {
        setErrorMessage(resultado.mensagem);
        return;
      }
      setSuccessMessage(resultado.mensagem);
      await onSuccess?.();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar regras",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsSectionCard
      className={className}
      eyebrow="Certificados"
      title="Regras de emissão"
      description="Critérios acadêmicos aplicados antes da emissão manual."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="maximoFaltas"
          control={control}
          render={({ field }) => (
            <div>
              <label
                htmlFor="certificate-absence"
                className={settingsLabelClass}
              >
                Máximo de faltas permitido
              </label>
              <input
                id="certificate-absence"
                type="number"
                min="0"
                placeholder="2"
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
                name={field.name}
                ref={field.ref}
                disabled={isSubmitting}
                className={getSettingsFieldClass(Boolean(errors.maximoFaltas))}
              />
              {errors.maximoFaltas && (
                <p className={settingsErrorClass}>
                  {errors.maximoFaltas.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="apenasEncerrada"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition hover:bg-slate-100">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                disabled={isSubmitting}
                className="mt-0.5 size-4 rounded border-slate-300 text-brand-dark focus:ring-2 focus:ring-brand-dark"
              />
              <span>
                <span className="block font-medium text-slate-800">
                  Exigir turma encerrada
                </span>
                <span className="mt-0.5 block text-slate-500 text-xs">
                  Certificados só podem ser emitidos após conclusão da turma.
                </span>
              </span>
            </label>
          )}
        />

        {successMessage && (
          <Notificacao tipo="sucesso">{successMessage}</Notificacao>
        )}

        {errorMessage && <Notificacao tipo="erro">{errorMessage}</Notificacao>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={settingsSubmitButtonClass}
          >
            {isSubmitting ? "Salvando..." : "Salvar regras"}
          </button>
        </div>
      </form>
    </SettingsSectionCard>
  );
};
