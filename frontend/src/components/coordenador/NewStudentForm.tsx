"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { convidarAlunoAction } from "@/app/coordenador/actions";
import { ActivationNotice } from "@/components/coordenador/ActivationNotice";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import type { ClassGroup, Course } from "@/types/coordinator";

interface NewStudentFormProps {
  courses: Course[];
  classes: ClassGroup[];
  isOpen: boolean;
  onCancel: () => void;
}

interface StudentFormData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  curso: string;
  turma: string;
}

const INITIAL_FORM_DATA: StudentFormData = {
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
  dataNascimento: "",
  curso: "",
  turma: "",
};

export const NewStudentForm = ({
  courses,
  classes,
  isOpen,
  onCancel,
}: NewStudentFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_FORM_DATA);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableClasses = classes.filter(
    (classGroup) => classGroup.curso === formData.curso,
  );

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
    const resultado = await convidarAlunoAction({
      ...formData,
      telefone: formData.telefone || undefined,
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
      aria-labelledby="new-student-heading"
      className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm"
    >
      <div>
        <h2
          id="new-student-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Novo aluno
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Cadastre os dados e defina o vínculo acadêmico inicial.
        </p>
      </div>

      <ActivationNotice userLabel="aluno" />

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
            Nome
            <input
              required
              type="text"
              value={formData.nome}
              onChange={(event) =>
                setFormData({ ...formData, nome: event.target.value })
              }
              placeholder="Nome completo"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            E-mail
            <input
              required
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              placeholder="aluno@email.com"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            CPF
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={14}
              value={formData.cpf}
              onChange={(event) =>
                setFormData({ ...formData, cpf: event.target.value })
              }
              placeholder="000.000.000-00"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Telefone
            <span className="sr-only">Opcional</span>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(event) =>
                setFormData({ ...formData, telefone: event.target.value })
              }
              placeholder="(83) 99999-9999 (opcional)"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Data de nascimento
            <input
              required
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={formData.dataNascimento}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  dataNascimento: event.target.value,
                })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Curso
            <select
              required
              value={formData.curso}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  curso: event.target.value,
                  turma: "",
                })
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
            Turma
            <select
              required
              disabled={!formData.curso}
              value={formData.turma}
              onChange={(event) =>
                setFormData({ ...formData, turma: event.target.value })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Selecione uma turma</option>
              {availableClasses.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.nome}>
                  {classGroup.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-y-2">
            <span className="font-medium text-slate-700 text-sm">
              Status inicial
            </span>
            <div className="flex h-11 items-center rounded-lg border border-amber-200 bg-amber-50 px-3 font-medium text-amber-800 text-sm">
              Pendente de ativação
            </div>
          </div>
        </div>

        <CoordinatorFormActions
          submitLabel={
            isSubmitting ? "Enviando..." : "Enviar convite de ativação"
          }
          onCancel={handleCancel}
          disabled={isSubmitting}
        />
      </form>
    </section>
  );
};
