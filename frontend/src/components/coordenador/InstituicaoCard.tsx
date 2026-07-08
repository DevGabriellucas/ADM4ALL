"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { instituicaoSchema, type InstituicaoFormData } from "@/schemas/configuracionsSchema";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { configService } from "@/services/configService";

interface InstituicaoCardProps {
  initialData: InstituicaoFormData;
  onSuccess?: () => void;
}

export const InstituicaoCard = ({ initialData, onSuccess }: InstituicaoCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<InstituicaoFormData>({
    resolver: zodResolver(instituicaoSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: InstituicaoFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await configService.atualizarInstituicao(data);
      setSuccessMessage("Dados atualizados com sucesso!");
      onSuccess?.();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar dados"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#D5DDEC] bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold text-lg text-slate-950">
        Dados da Instituição
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nome da Instituição
              </label>
              <Input
                {...field}
                type="text"
                placeholder="Digite o nome da instituição"
                disabled={isSubmitting}
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-red-500">{errors.nome.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                E-mail de Contato
              </label>
              <Input
                {...field}
                type="email"
                placeholder="contato@instituicao.com"
                disabled={isSubmitting}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <Input
                  {...field}
                  type="tel"
                  placeholder="(11) 9999-9999"
                  disabled={isSubmitting}
                  className={errors.telefone ? "border-red-500" : ""}
                />
                {errors.telefone && (
                  <p className="mt-1 text-xs text-red-500">{errors.telefone.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="cidade"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Cidade
                </label>
                <Input
                  {...field}
                  type="text"
                  placeholder="São Paulo"
                  disabled={isSubmitting}
                  className={errors.cidade ? "border-red-500" : ""}
                />
                {errors.cidade && (
                  <p className="mt-1 text-xs text-red-500">{errors.cidade.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="max-w-xs">
          <Controller
            name="uf"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  UF
                </label>
                <Input
                  {...field}
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  disabled={isSubmitting}
                  className={errors.uf ? "border-red-500" : ""}
                />
                {errors.uf && (
                  <p className="mt-1 text-xs text-red-500">{errors.uf.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {successMessage && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-dark hover:bg-[#23275F]"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
};
