"use client";

import type { SubmitEvent } from "react";
import { useState } from "react";
import type { ClassStatus, Course, Instructor } from "@/types/coordinator";

interface NewClassFormProps {
  courses: Course[];
  instructors: Instructor[];
  isOpen: boolean;
  onCancel: () => void;
}

interface ClassFormData {
  curso: string;
  nome: string;
  instrutor: string;
  dataInicio: string;
  dataTermino: string;
  horarios: string;
  limiteAlunos: string;
  status: ClassStatus;
}

const INITIAL_FORM_DATA: ClassFormData = {
  curso: "",
  nome: "",
  instrutor: "",
  dataInicio: "",
  dataTermino: "",
  horarios: "",
  limiteAlunos: "",
  status: "planejada",
};

export const NewClassForm = ({
  courses,
  instructors,
  isOpen,
  onCancel,
}: NewClassFormProps) => {
  const [formData, setFormData] = useState<ClassFormData>(INITIAL_FORM_DATA);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeInstructors = instructors.filter(
    (instructor) => instructor.status === "ativo",
  );

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setSuccessMessage(null);
    onCancel();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    // MOCK TEMPORARIO: a API de cadastro substituirá esta confirmação local.
    setSuccessMessage(
      `Turma "${formData.nome}" pronta para ser enviada quando a API estiver disponível.`,
    );
    setFormData(INITIAL_FORM_DATA);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-labelledby="new-class-heading"
      className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm"
    >
      <div>
        <h2
          id="new-class-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Nova turma
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Defina o curso, o responsável e o período da nova turma.
        </p>
      </div>

      {successMessage && (
        <output
          aria-live="polite"
          className="mt-4 block rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm"
        >
          {successMessage}
        </output>
      )}

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Curso
            <select
              required
              value={formData.curso}
              onChange={(event) =>
                setFormData({ ...formData, curso: event.target.value })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Selecione um curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.nome}>
                  {course.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Nome da turma
            <input
              required
              type="text"
              value={formData.nome}
              onChange={(event) =>
                setFormData({ ...formData, nome: event.target.value })
              }
              placeholder="Ex.: ADM-2026-03"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Instrutor responsável
            <select
              required
              value={formData.instrutor}
              onChange={(event) =>
                setFormData({ ...formData, instrutor: event.target.value })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Selecione um instrutor</option>
              {activeInstructors.map((instructor) => (
                <option key={instructor.id} value={instructor.nome}>
                  {instructor.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Limite de alunos
            <input
              required
              min="1"
              type="number"
              value={formData.limiteAlunos}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  limiteAlunos: event.target.value,
                })
              }
              placeholder="Ex.: 30"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Data de início
            <input
              required
              type="date"
              value={formData.dataInicio}
              onChange={(event) =>
                setFormData({ ...formData, dataInicio: event.target.value })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Data de término
            <input
              required
              min={formData.dataInicio}
              type="date"
              value={formData.dataTermino}
              onChange={(event) =>
                setFormData({ ...formData, dataTermino: event.target.value })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm md:col-span-2">
            Dias e horários das aulas
            <input
              required
              type="text"
              value={formData.horarios}
              onChange={(event) =>
                setFormData({ ...formData, horarios: event.target.value })
              }
              placeholder="Ex.: Segundas e quartas, das 19h às 21h"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Status
            <select
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value as ClassStatus,
                })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="planejada">Planejada</option>
              <option value="em_andamento">Em andamento</option>
              <option value="encerrada">Concluída</option>
              <option value="cancelada">Cancelada</option>
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
            Salvar turma
          </button>
        </div>
      </form>
    </section>
  );
};
