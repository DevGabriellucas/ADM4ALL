"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { atualizarCertificadoAction } from "@/app/coordenador/actions";
import {
  type CertificadoFormData,
  certificadoSchema,
} from "@/schemas/configuracionsSchema";

interface CertificadoCardProps {
  initialData: CertificadoFormData;
  onSuccess?: () => void;
}

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:opacity-60";

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
    <div className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
        Regras de Certificado
      </h2>
      <p className="mt-1 text-slate-500 text-xs">
        Configure os critérios para emissão de certificados.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <div className="max-w-xs">
          <Controller
            name="maximoFaltas"
            control={control}
            render={({ field }) => (
              <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
                Máximo de Faltas Permitido
                <input
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
                  className={`${INPUT_CLASS} ${errors.maximoFaltas ? "border-red-500" : ""}`}
                />
                {errors.maximoFaltas && (
                  <p className="text-xs text-red-500">
                    {errors.maximoFaltas.message}
                  </p>
                )}
              </label>
            )}
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-center gap-3">
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
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-dark focus:ring-brand-light/30"
                />
              )}
            />
            <span className="font-medium text-slate-700 text-sm">
              Permitir certificado apenas para turmas encerradas/concluídas
            </span>
          </label>
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
