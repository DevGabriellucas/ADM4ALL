"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { criarCursoAction } from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import { Notificacao } from "@/components/shared/Notificacao";
import type { CourseStatus } from "@/types/coordinator";

interface NewCourseFormProps {
  isOpen: boolean;
  onCancel: () => void;
}

interface CourseFormData {
  nome: string;
  descricao: string;
  cargaHoraria: string;
  status: CourseStatus;
}

const INITIAL_FORM_DATA: CourseFormData = {
  nome: "",
  descricao: "",
  cargaHoraria: "",
  status: "em_planejamento",
};

export const NewCourseForm = ({ isOpen, onCancel }: NewCourseFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>(INITIAL_FORM_DATA);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
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
      status: formData.status,
    });

    setIsSubmitting(false);

    if (!resultado.sucesso) {
      setErrorMessage(resultado.mensagem);
      return;
    }

    setSuccessMessage(resultado.mensagem);
    setFormData(INITIAL_FORM_DATA);
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
              min="1"
              type="number"
              value={formData.cargaHoraria}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  cargaHoraria: event.target.value,
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
              className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Status
            <select
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value as CourseStatus,
                })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="em_planejamento">Em planejamento</option>
              <option value="ativo">Ativo</option>
            </select>
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
