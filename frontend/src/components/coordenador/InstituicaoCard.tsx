"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarInstituicaoAction } from "@/app/coordenador/actions";
import {
  getSettingsFieldClass,
  SettingsSectionCard,
  settingsErrorClass,
  settingsLabelClass,
  settingsSubmitButtonClass,
} from "@/components/coordenador/SettingsSectionCard";
import {
  type InstituicaoFormData,
  instituicaoSchema,
} from "@/schemas/configuracionsSchema";

interface InstituicaoCardProps {
  className?: string;
  initialData: InstituicaoFormData;
  onSuccess?: () => Promise<void> | void;
}

export const InstituicaoCard = ({
  className,
  initialData,
  onSuccess,
}: InstituicaoCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstituicaoFormData>({
    resolver: zodResolver(instituicaoSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = async (data: InstituicaoFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const resultado = await atualizarInstituicaoAction(data);
      if (!resultado.sucesso) {
        setErrorMessage(resultado.mensagem);
        return;
      }
      setSuccessMessage(resultado.mensagem);
      await onSuccess?.();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar dados",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsSectionCard
      className={className}
      eyebrow="Identidade"
      title="Dados da instituição"
      description="Informações exibidas em comunicações, relatórios e certificados."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <div>
                <label
                  htmlFor="institution-name"
                  className={settingsLabelClass}
                >
                  Nome da instituição
                </label>
                <input
                  {...field}
                  id="institution-name"
                  type="text"
                  placeholder="Administração para Todos"
                  disabled={isSubmitting}
                  className={getSettingsFieldClass(Boolean(errors.nome))}
                />
                {errors.nome && (
                  <p className={settingsErrorClass}>{errors.nome.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <div>
                <label
                  htmlFor="institution-email"
                  className={settingsLabelClass}
                >
                  E-mail de contato
                </label>
                <input
                  {...field}
                  id="institution-email"
                  type="email"
                  placeholder="contato@instituicao.edu.br"
                  disabled={isSubmitting}
                  className={getSettingsFieldClass(Boolean(errors.email))}
                />
                {errors.email && (
                  <p className={settingsErrorClass}>{errors.email.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <div>
                <label
                  htmlFor="institution-phone"
                  className={settingsLabelClass}
                >
                  Telefone
                </label>
                <input
                  {...field}
                  id="institution-phone"
                  type="tel"
                  placeholder="(83) 99999-9999"
                  disabled={isSubmitting}
                  className={getSettingsFieldClass(Boolean(errors.telefone))}
                />
                {errors.telefone && (
                  <p className={settingsErrorClass}>
                    {errors.telefone.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="grid grid-cols-[1fr_5rem] gap-4">
            <Controller
              name="cidade"
              control={control}
              render={({ field }) => (
                <div>
                  <label
                    htmlFor="institution-city"
                    className={settingsLabelClass}
                  >
                    Cidade
                  </label>
                  <input
                    {...field}
                    id="institution-city"
                    type="text"
                    placeholder="João Pessoa"
                    disabled={isSubmitting}
                    className={getSettingsFieldClass(Boolean(errors.cidade))}
                  />
                  {errors.cidade && (
                    <p className={settingsErrorClass}>
                      {errors.cidade.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="uf"
              control={control}
              render={({ field }) => (
                <div>
                  <label
                    htmlFor="institution-uf"
                    className={settingsLabelClass}
                  >
                    UF
                  </label>
                  <input
                    {...field}
                    id="institution-uf"
                    type="text"
                    placeholder="PB"
                    maxLength={2}
                    disabled={isSubmitting}
                    className={getSettingsFieldClass(Boolean(errors.uf))}
                  />
                  {errors.uf && (
                    <p className={settingsErrorClass}>{errors.uf.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

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
            {isSubmitting ? "Salvando..." : "Salvar instituição"}
          </button>
        </div>
      </form>
    </SettingsSectionCard>
  );
};
