"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { criarTurmaAction } from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import type { ClassStatus, Course, Instructor } from "@/types/coordinator";

interface ClassFormData {
  curso: string;
  nome: string;
  instrutoresSelecionados: string[];
  periodoLetivo: string;
  horarios: string;
  capacidade: string;
  status: ClassStatus;
}

interface ClassDefaultValues {
  periodoLetivo?: string;
  capacidade?: string;
  status?: ClassStatus;
}

interface NewClassFormProps {
  courses: Course[];
  instructors: Instructor[];
  isOpen: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  defaultCourseName?: string;
  defaultCourseId?: string;
  lockCourse?: boolean;
  defaultValues?: ClassDefaultValues;
}

const INITIAL_FORM_DATA: ClassFormData = {
  curso: "",
  nome: "",
  instrutoresSelecionados: [],
  periodoLetivo: "",
  horarios: "",
  capacidade: "",
  status: "planejada",
};

const construirDadosIniciais = (
  defaultCourseName?: string,
  defaults?: ClassDefaultValues,
): ClassFormData => ({
  curso: defaultCourseName ?? "",
  nome: "",
  instrutoresSelecionados: [],
  periodoLetivo: defaults?.periodoLetivo ?? "",
  horarios: "",
  capacidade: defaults?.capacidade ?? "",
  status: defaults?.status ?? "planejada",
});

export const NewClassForm = ({
  courses,
  instructors,
  isOpen,
  onCancel,
  onSuccess,
  defaultCourseName,
  defaultCourseId,
  lockCourse,
  defaultValues,
}: NewClassFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<ClassFormData>(
    construirDadosIniciais(defaultCourseName, defaultValues),
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeInstructors = instructors.filter(
    (instructor) => instructor.status === "ativo",
  );

  const toggleInstrutor = (nome: string) => {
    setFormData((prev) => {
      const selected = prev.instrutoresSelecionados.includes(nome)
        ? prev.instrutoresSelecionados.filter((n) => n !== nome)
        : [...prev.instrutoresSelecionados, nome];

      return { ...prev, instrutoresSelecionados: selected };
    });
  };

  const handleCancel = () => {
    setFormData(construirDadosIniciais(defaultCourseName, defaultValues));
    setSuccessMessage(null);
    setErrorMessage(null);
    onCancel();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (formData.instrutoresSelecionados.length === 0) {
      setIsSubmitting(false);
      setErrorMessage("Selecione pelo menos um instrutor.");
      return;
    }

    const resultado = await criarTurmaAction({
      curso: formData.curso,
      nome: formData.nome,
      instrutores: formData.instrutoresSelecionados,
      periodoLetivo: formData.periodoLetivo,
      horarios: formData.horarios,
      capacidade: Number(formData.capacidade),
      status: formData.status,
      cursoId: defaultCourseId,
    });

    setIsSubmitting(false);

    if (!resultado.sucesso) {
      setErrorMessage(resultado.mensagem);
      return;
    }

    setSuccessMessage(resultado.mensagem);
    setFormData(construirDadosIniciais(defaultCourseName, defaultValues));
    router.refresh();
    onSuccess?.();
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
          Defina o curso, os instrutores e o período da nova turma.
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

      {errorMessage && (
        <output
          aria-live="polite"
          className="mt-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
        >
          {errorMessage}
        </output>
      )}

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Curso
            <select
              required
              disabled={lockCourse}
              value={formData.curso}
              onChange={(event) =>
                setFormData({ ...formData, curso: event.target.value })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
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

          <div className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm md:col-span-2">
            Instrutores
            {activeInstructors.length === 0 ? (
              <p className="text-slate-500 text-sm">
                Nenhum instrutor ativo disponível.
              </p>
            ) : (
              <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-300 bg-white p-3">
                {activeInstructors.map((instructor) => {
                  const checked = formData.instrutoresSelecionados.includes(
                    instructor.nome,
                  );

                  return (
                    <label
                      key={instructor.id}
                      className="flex cursor-pointer items-center gap-x-2 rounded px-2 py-1.5 font-normal transition-colors hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleInstrutor(instructor.nome)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-dark focus:ring-brand-light/30"
                      />
                      <span className="text-slate-900 text-sm">
                        {instructor.nome}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Capacidade
            <input
              required
              min="1"
              type="number"
              value={formData.capacidade}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  capacidade: event.target.value,
                })
              }
              placeholder="Ex.: 30"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Período letivo
            <input
              required
              type="text"
              value={formData.periodoLetivo}
              onChange={(event) =>
                setFormData({ ...formData, periodoLetivo: event.target.value })
              }
              placeholder="2026.1"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
            <span className="text-slate-400 text-xs">
              Use o formato ano.semestre, por exemplo 2026.1 ou 2026.2.
            </span>
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
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
        </div>

        <CoordinatorFormActions
          submitLabel={isSubmitting ? "Salvando..." : "Salvar turma"}
          onCancel={handleCancel}
          disabled={isSubmitting}
        />
      </form>
    </section>
  );
};
