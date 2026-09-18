"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarPreferenciasAction } from "@/app/coordenador/actions";
import {
  getSettingsFieldClass,
  SettingsSectionCard,
  settingsErrorClass,
  settingsLabelClass,
  settingsSubmitButtonClass,
} from "@/components/coordenador/SettingsSectionCard";
import {
  Notificacao,
  PRAZO_PARA_LIMPAR_AVISO,
} from "@/components/shared/Notificacao";
import {
  type PreferenciasFormData,
  preferencesSchema,
} from "@/schemas/configuracionsSchema";

interface PreferenciasCardProps {
  className?: string;
  initialData: PreferenciasFormData;
  onSuccess?: () => Promise<void> | void;
}

export const PreferenciasCard = ({
  className,
  initialData,
  onSuccess,
}: PreferenciasCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PreferenciasFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = async (data: PreferenciasFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const resultado = await atualizarPreferenciasAction(data);
      if (!resultado.sucesso) {
        setErrorMessage(resultado.mensagem);
        return;
      }
      setSuccessMessage(resultado.mensagem);
      await onSuccess?.();
      setTimeout(() => setSuccessMessage(null), PRAZO_PARA_LIMPAR_AVISO);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar preferências",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsSectionCard
      className={className}
      eyebrow="Padrões"
      title="Preferências gerais"
      description="Valores iniciais usados em novas turmas e painéis."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Controller
            name="capacidadePadrao"
            control={control}
            render={({ field }) => (
              <div>
                <label
                  htmlFor="default-capacity"
                  className={settingsLabelClass}
                >
                  Capacidade padrão
                </label>
                <input
                  id="default-capacity"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={field.value ?? ""}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  name={field.name}
                  ref={field.ref}
                  disabled={isSubmitting}
                  className={getSettingsFieldClass(
                    Boolean(errors.capacidadePadrao),
                  )}
                />
                {errors.capacidadePadrao && (
                  <p className={settingsErrorClass}>
                    {errors.capacidadePadrao.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="statusPadrao"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="default-status" className={settingsLabelClass}>
                  Status padrão de turma
                </label>
                <select
                  {...field}
                  id="default-status"
                  disabled={isSubmitting}
                  className={getSettingsFieldClass(
                    Boolean(errors.statusPadrao),
                  )}
                >
                  <option value="">Selecione um status</option>
                  <option value="planejada">Planejada</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="encerrada">Encerrada</option>
                </select>
                {errors.statusPadrao && (
                  <p className={settingsErrorClass}>
                    {errors.statusPadrao.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="nomeExibido"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="display-name" className={settingsLabelClass}>
                  Nome exibido
                </label>
                <input
                  {...field}
                  id="display-name"
                  type="text"
                  placeholder="ADM4All"
                  disabled={isSubmitting}
                  className={getSettingsFieldClass(Boolean(errors.nomeExibido))}
                />
                {errors.nomeExibido && (
                  <p className={settingsErrorClass}>
                    {errors.nomeExibido.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

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
            {isSubmitting ? "Salvando..." : "Salvar preferências"}
          </button>
        </div>
      </form>
    </SettingsSectionCard>
  );
};
