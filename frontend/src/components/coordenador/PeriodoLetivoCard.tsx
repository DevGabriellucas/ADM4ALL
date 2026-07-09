"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarPeriodoLetivoConfigAction } from "@/app/coordenador/actions";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  type PeriodoLetivoFormData,
  periodoLetivoSchema,
} from "@/schemas/configuracionsSchema";

interface PeriodoLetivoCardProps {
  initialData: string;
  onSuccess?: () => void;
}

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
    <div className="rounded-lg border border-[#D5DDEC] bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-semibold text-lg text-slate-950">
        Período Letivo Atual
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        Este período será automaticamente preenchido ao criar novas turmas.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-w-xs">
          <Controller
            name="valor"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Formato: YYYY.S (ex: 2026.1)
                </label>
                <Input
                  {...field}
                  type="text"
                  placeholder="2026.1"
                  disabled={isSubmitting}
                  className={errors.valor ? "border-red-500" : ""}
                />
                {errors.valor && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.valor.message}
                  </p>
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
