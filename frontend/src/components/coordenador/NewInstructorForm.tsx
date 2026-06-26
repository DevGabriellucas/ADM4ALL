"use client";

import type { SubmitEvent } from "react";
import { useState } from "react";
import { ActivationNotice } from "@/components/coordenador/ActivationNotice";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";

interface NewInstructorFormProps {
  isOpen: boolean;
  onCancel: () => void;
}

interface InstructorFormData {
  nome: string;
  email: string;
  telefone: string;
}

const INITIAL_FORM_DATA: InstructorFormData = {
  nome: "",
  email: "",
  telefone: "",
};

export const NewInstructorForm = ({
  isOpen,
  onCancel,
}: NewInstructorFormProps) => {
  const [formData, setFormData] =
    useState<InstructorFormData>(INITIAL_FORM_DATA);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setSuccessMessage(null);
    onCancel();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    // MOCK TEMPORARIO: futuramente a API criara o usuario e enviara o e-mail.
    setSuccessMessage(
      `Convite de ativação preparado para ${formData.email}. Nenhum e-mail foi enviado nesta versão.`,
    );
    setFormData(INITIAL_FORM_DATA);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-labelledby="new-instructor-heading"
      className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm"
    >
      <div>
        <h2
          id="new-instructor-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Novo instrutor
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Cadastre os dados para preparar o convite de acesso.
        </p>
      </div>

      <ActivationNotice userLabel="instrutor" />

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
              placeholder="instrutor@email.com"
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
        </div>

        <CoordinatorFormActions
          submitLabel="Enviar convite de ativação"
          onCancel={handleCancel}
        />
      </form>
    </section>
  );
};
