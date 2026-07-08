"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  preferencesSchema,
  type PreferenciasFormData,
} from "@/schemas/configuracionsSchema";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { configService } from "@/services/configService";

interface PreferenciasCardProps {
  initialData: PreferenciasFormData;
  onSuccess?: () => void;
}

export const PreferenciasCard = ({
  initialData,
  onSuccess,
}: PreferenciasCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<PreferenciasFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: PreferenciasFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await configService.atualizarPreferencias(data);
      setSuccessMessage("Preferências atualizadas com sucesso!");
      onSuccess?.();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar preferências"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#D5DDEC] bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-semibold text-lg text-slate-950">
        Preferências Gerais
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        Configure valores padrão para novas turmas e outras preferências.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="capacidadePadrao"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Capacidade Padrão (alunos)
                </label>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="30"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  disabled={isSubmitting}
                  className={errors.capacidadePadrao ? "border-red-500" : ""}
                />
                {errors.capacidadePadrao && (
                  <p className="mt-1 text-xs text-red-500">
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status Padrão de Nova Turma
                </label>
                <Select
                  {...field}
                  disabled={isSubmitting}
                  className={errors.statusPadrao ? "border-red-500" : ""}
                >
                  <option value="">Selecione um status</option>
                  <option value="planejamento">Planejamento</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="encerrada">Encerrada</option>
                </Select>
                {errors.statusPadrao && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.statusPadrao.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <Controller
          name="nomeExibido"
          control={control}
          render={({ field }) => (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nome Exibido no Painel (opcional)
              </label>
              <Input
                {...field}
                type="text"
                placeholder="ADM4All"
                disabled={isSubmitting}
                className={errors.nomeExibido ? "border-red-500" : ""}
              />
              {errors.nomeExibido && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.nomeExibido.message}
                </p>
              )}
            </div>
          )}
        />

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
