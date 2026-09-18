"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { atualizarInstrutorAction } from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import { Notificacao } from "@/components/shared/Notificacao";
import type { InstructorDetail } from "@/types/coordinator";
import { formatarTelefone } from "@/utils/telefone";

interface InstructorEditFormProps {
  instructor: InstructorDetail;
  onCancel: () => void;
}

interface InstructorEditFormData {
  nome: string;
  email: string;
  telefone: string;
  areaAtuacao: string;
  formacao: string;
}

export const InstructorEditForm = ({
  instructor,
  onCancel,
}: InstructorEditFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<InstructorEditFormData>({
    nome: instructor.nome,
    email: instructor.email,
    telefone: instructor.telefone ?? "",
    areaAtuacao: instructor.areaAtuacao ?? "",
    formacao: instructor.formacao ?? "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const resultado = await atualizarInstrutorAction(instructor.id, {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone || null,
      areaAtuacao: formData.areaAtuacao || null,
      formacao: formData.formacao || null,
    });

    setIsSubmitting(false);

    if (!resultado.sucesso) {
      setErrorMessage(resultado.mensagem);
      return;
    }

    setSuccessMessage(resultado.mensagem);
    router.refresh();
  };

  return (
    <section
      aria-labelledby="edit-instructor-heading"
      className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm"
    >
      <div>
        <h2
          id="edit-instructor-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Editar instrutor
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Atualize dados de contato e informacoes profissionais.
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
            Nome
            <input
              required
              type="text"
              value={formData.nome}
              onChange={(event) =>
                setFormData({ ...formData, nome: event.target.value })
              }
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
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Telefone
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
              placeholder="(83) 99999-9999"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Área de atuação
            <input
              type="text"
              value={formData.areaAtuacao}
              onChange={(event) =>
                setFormData({ ...formData, areaAtuacao: event.target.value })
              }
              placeholder="Administracao, RH, Contabil..."
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm md:col-span-2">
            Formacao
            <input
              type="text"
              value={formData.formacao}
              onChange={(event) =>
                setFormData({ ...formData, formacao: event.target.value })
              }
              placeholder="Formacao academica ou experiencia principal"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>
        </div>

        <CoordinatorFormActions
          submitLabel={isSubmitting ? "Salvando..." : "Salvar alteracoes"}
          onCancel={onCancel}
          disabled={isSubmitting}
        />
      </form>
    </section>
  );
};
