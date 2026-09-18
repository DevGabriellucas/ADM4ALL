"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { convidarInstrutorAction } from "@/app/coordenador/actions";
import { ActivationNotice } from "@/components/coordenador/ActivationNotice";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import { Notificacao } from "@/components/shared/Notificacao";
import { formatarCpf } from "@/utils/cpf";
import { formatarTelefone } from "@/utils/telefone";

interface NewInstructorFormProps {
  isOpen: boolean;
  onCancel: () => void;
}

interface InstructorFormData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}

const INITIAL_FORM_DATA: InstructorFormData = {
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
};

export const NewInstructorForm = ({
  isOpen,
  onCancel,
}: NewInstructorFormProps) => {
  const router = useRouter();
  const [formData, setFormData] =
    useState<InstructorFormData>(INITIAL_FORM_DATA);
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

    const resultado = await convidarInstrutorAction({
      nome: formData.nome,
      email: formData.email,
      cpf: formData.cpf,
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
          Cadastre os dados do instrutor. Nenhum e-mail é enviado.
        </p>
      </div>

      <ActivationNotice userLabel="instrutor" enviaEmail={false} />

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
              autoComplete="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  email: event.target.value,
                })
              }
              placeholder="instrutor@email.com"
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
                setFormData({
                  ...formData,
                  cpf: formatarCpf(event.target.value),
                })
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
              inputMode="tel"
              maxLength={15}
              value={formData.telefone}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  telefone: formatarTelefone(event.target.value),
                })
              }
              placeholder="(83) 99999-9999 (opcional)"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>
        </div>

        <CoordinatorFormActions
          submitLabel={isSubmitting ? "Cadastrando..." : "Cadastrar instrutor"}
          onCancel={handleCancel}
          disabled={isSubmitting}
        />
      </form>
    </section>
  );
};
