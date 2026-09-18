"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { criarCursoAction } from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import { Notificacao } from "@/components/shared/Notificacao";
import { somenteDigitos } from "@/utils/numeros";

interface NewCourseFormProps {
  isOpen: boolean;
  onCancel: () => void;
  /** Periodo letivo configurado no sistema, sugerido no campo do formulario. */
  periodoLetivoPadrao?: string;
}

interface CourseFormData {
  nome: string;
  descricao: string;
  cargaHoraria: string;
  periodoLetivo: string;
}

const montarFormularioVazio = (periodoLetivo: string): CourseFormData => ({
  nome: "",
  descricao: "",
  cargaHoraria: "",
  periodoLetivo,
});

// O status nao entra no formulario: o sistema calcula sozinho, a partir das
// turmas do curso. Curso novo nasce "Em planejamento" porque ainda nao tem
// turma nenhuma.
export const NewCourseForm = ({
  isOpen,
  onCancel,
  periodoLetivoPadrao = "",
}: NewCourseFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>(() =>
    montarFormularioVazio(periodoLetivoPadrao),
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    setFormData(montarFormularioVazio(periodoLetivoPadrao));
    setSuccessMessage(null);
    setErrorMessage(null);
    onCancel();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const resultado = await criarCursoAction({
      nome: formData.nome,
      descricao: formData.descricao,
      cargaHoraria: Number(formData.cargaHoraria),
      periodoLetivo: formData.periodoLetivo,
    });

    setIsSubmitting(false);

    if (!resultado.sucesso) {
      setErrorMessage(resultado.mensagem);
      return;
    }

    setSuccessMessage(resultado.mensagem);
    setFormData(montarFormularioVazio(periodoLetivoPadrao));
    router.refresh();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-labelledby="new-course-heading"
      className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm"
    >
      <div>
        <h2
          id="new-course-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Novo curso
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Preencha os dados básicos para iniciar o cadastro.
        </p>
      </div>

      {successMessage && (
        <Notificacao tipo="sucesso" className="mt-4">
          {successMessage}
        </Notificacao>
      )}

      {errorMessage && (
        <Notificacao tipo="erro" className="mt-4">
          {errorMessage}
        </Notificacao>
      )}

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Nome do curso
            <input
              required
              type="text"
              value={formData.nome}
              onChange={(event) =>
                setFormData({ ...formData, nome: event.target.value })
              }
              placeholder="Ex.: Assistente Administrativo"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Carga horária
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={formData.cargaHoraria}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  cargaHoraria: somenteDigitos(event.target.value),
                })
              }
              placeholder="Ex.: 40"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm md:col-span-2">
            Descrição
            <textarea
              required
              rows={4}
              value={formData.descricao}
              onChange={(event) =>
                setFormData({ ...formData, descricao: event.target.value })
              }
              placeholder="Descreva o objetivo e o conteúdo do curso"
              className="resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Período letivo
            <input
              required
              type="text"
              value={formData.periodoLetivo}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  periodoLetivo: event.target.value,
                })
              }
              placeholder="2026.1"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
            <span className="font-normal text-slate-400 text-xs">
              Use o formato ano.semestre, por exemplo 2026.1 ou 2026.2.
            </span>
          </label>
        </div>

        <CoordinatorFormActions
          submitLabel={isSubmitting ? "Salvando..." : "Salvar curso"}
          onCancel={handleCancel}
          disabled={isSubmitting}
        />
      </form>
    </section>
  );
};
