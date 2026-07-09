"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarInstituicaoAction } from "@/app/coordenador/actions";
import {
  type InstituicaoFormData,
  instituicaoSchema,
} from "@/schemas/configuracionsSchema";

interface InstituicaoCardProps {
  initialData: InstituicaoFormData;
  onSuccess?: () => void;
}

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:opacity-60";

export const InstituicaoCard = ({
  initialData,
  onSuccess,
}: InstituicaoCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InstituicaoFormData>({
    resolver: zodResolver(instituicaoSchema),
    defaultValues: initialData,
  });

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
      onSuccess?.();
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
    <div className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
        Dados da Instituição
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Nome da Instituição
              <input
                {...field}
                type="text"
                placeholder="Digite o nome da instituição"
                disabled={isSubmitting}
                className={`${INPUT_CLASS} ${errors.nome ? "border-red-500" : ""}`}
              />
              {errors.nome && (
                <p className="text-xs text-red-500">{errors.nome.message}</p>
              )}
            </label>
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              E-mail de Contato
              <input
                {...field}
                type="email"
                placeholder="contato@instituicao.com"
                disabled={isSubmitting}
                className={`${INPUT_CLASS} ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </label>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
                Telefone
                <input
                  {...field}
                  type="tel"
                  placeholder="(11) 9999-9999"
                  disabled={isSubmitting}
                  className={`${INPUT_CLASS} ${errors.telefone ? "border-red-500" : ""}`}
                />
                {errors.telefone && (
                  <p className="text-xs text-red-500">
                    {errors.telefone.message}
                  </p>
                )}
              </label>
            )}
          />

          <Controller
            name="cidade"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
                Cidade
                <input
                  {...field}
                  type="text"
                  placeholder="São Paulo"
                  disabled={isSubmitting}
                  className={`${INPUT_CLASS} ${errors.cidade ? "border-red-500" : ""}`}
                />
                {errors.cidade && (
                  <p className="text-xs text-red-500">
                    {errors.cidade.message}
                  </p>
                )}
              </label>
            )}
          />
        </div>

        <div className="max-w-xs">
          <Controller
            name="uf"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
                UF
                <input
                  {...field}
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  disabled={isSubmitting}
                  className={`${INPUT_CLASS} ${errors.uf ? "border-red-500" : ""}`}
                />
                {errors.uf && (
                  <p className="text-xs text-red-500">{errors.uf.message}</p>
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
