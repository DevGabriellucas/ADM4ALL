"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarPreferenciasAction } from "@/app/coordenador/actions";
import {
  type PreferenciasFormData,
  preferencesSchema,
} from "@/schemas/configuracionsSchema";

interface PreferenciasCardProps {
  initialData: PreferenciasFormData;
  onSuccess?: () => void;
}

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:opacity-60";
const SELECT_CLASS =
  "h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:opacity-60";

export const PreferenciasCard = ({
  initialData,
  onSuccess,
}: PreferenciasCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferenciasFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initialData,
  });

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
      onSuccess?.();
      setTimeout(() => setSuccessMessage(null), 3000);
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
    <div className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
        Preferências Gerais
      </h2>
      <p className="mt-1 text-slate-500 text-xs">
        Configure valores padrão para novas turmas e outras preferências.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="capacidadePadrao"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
                Capacidade Padrão (alunos)
                <input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="30"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  disabled={isSubmitting}
                  className={`${INPUT_CLASS} ${errors.capacidadePadrao ? "border-red-500" : ""}`}
                />
                {errors.capacidadePadrao && (
                  <p className="text-xs text-red-500">
                    {errors.capacidadePadrao.message}
                  </p>
                )}
              </label>
            )}
          />

          <Controller
            name="statusPadrao"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
                Status Padrão de Nova Turma
                <select
                  {...field}
                  disabled={isSubmitting}
                  className={`${SELECT_CLASS} ${errors.statusPadrao ? "border-red-500" : ""}`}
                >
                  <option value="">Selecione um status</option>
                  <option value="planejada">Planejada</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="encerrada">Encerrada</option>
                </select>
                {errors.statusPadrao && (
                  <p className="text-xs text-red-500">
                    {errors.statusPadrao.message}
                  </p>
                )}
              </label>
            )}
          />
        </div>

        <Controller
          name="nomeExibido"
          control={control}
          render={({ field }) => (
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Nome Exibido no Painel (opcional)
              <input
                {...field}
                type="text"
                placeholder="ADM4All"
                disabled={isSubmitting}
                className={`${INPUT_CLASS} ${errors.nomeExibido ? "border-red-500" : ""}`}
              />
              {errors.nomeExibido && (
                <p className="text-xs text-red-500">
                  {errors.nomeExibido.message}
                </p>
              )}
            </label>
          )}
        />

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
