"use client";

import type { FormEvent } from "react";
import { useState } from "react";
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
  const [formData, setFormData] = useState<CourseFormData>(INITIAL_FORM_DATA);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setSuccessMessage(null);
    onCancel();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // MOCK TEMPORARIO: a API de cadastro substituirá esta confirmação local.
    setSuccessMessage(
      `Curso "${formData.nome}" pronto para ser enviado quando a API estiver disponível.`,
    );
    setFormData(INITIAL_FORM_DATA);
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
        <output
          aria-live="polite"
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm"
        >
          {successMessage}
        </output>
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
              <option value="encerrado">Concluído</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-11 rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68]"
          >
            Salvar curso
          </button>
        </div>
      </form>
    </section>
  );
};
