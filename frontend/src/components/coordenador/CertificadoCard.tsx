"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarCertificadoAction } from "@/app/coordenador/actions";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  type CertificadoFormData,
  certificadoSchema,
} from "@/schemas/configuracionsSchema";

interface CertificadoCardProps {
  initialData: CertificadoFormData;
  onSuccess?: () => void;
}

export const CertificadoCard = ({
  initialData,
  onSuccess,
}: CertificadoCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificadoFormData>({
    resolver: zodResolver(certificadoSchema),
    defaultValues: initialData,
  });

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
      onSuccess?.();
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
    <div className="rounded-lg border border-[#D5DDEC] bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-semibold text-lg text-slate-950">
        Regras de Certificado
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        Configure os critérios para emissão de certificados.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-w-xs">
          <Controller
            name="maximoFaltas"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Máximo de Faltas Permitido
                </label>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  placeholder="2"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  disabled={isSubmitting}
                  className={errors.maximoFaltas ? "border-red-500" : ""}
                />
                {errors.maximoFaltas && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.maximoFaltas.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div>
          <label className="flex items-center gap-3">
            <Controller
              name="apenasEncerrada"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-gray-300 text-brand-dark focus:ring-2 focus:ring-brand-dark"
                />
              )}
            />
            <span className="text-sm font-medium text-slate-700">
              Permitir certificado apenas para turmas encerradas/concluídas
            </span>
          </label>
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
