"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { atualizarAlunoAction } from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import type { StudentDetail, UserStatus } from "@/types/coordinator";

interface StudentEditFormProps {
  student: StudentDetail;
  onCancel: () => void;
}

export const StudentEditForm = ({
  student,
  onCancel,
}: StudentEditFormProps) => {
  const router = useRouter();
  const [nome, setNome] = useState(student.nome);
  const [email, setEmail] = useState(student.email);
  const [telefone, setTelefone] = useState(student.telefone ?? "");
  const [statusConta, setStatusConta] = useState<UserStatus>(
    student.statusConta,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result = await atualizarAlunoAction(student.id, {
      nome,
      email,
      telefone: telefone || null,
      statusConta,
    });

    setIsSubmitting(false);

    if (!result.sucesso) {
      setErrorMessage(result.mensagem);
      return;
    }

    setSuccessMessage(result.mensagem);
    router.refresh();
  };

  return (
    <section
      aria-labelledby="student-edit-heading"
      className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm"
    >
      <h2
        id="student-edit-heading"
        className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
      >
        Editar dados básicos
      </h2>
      <p className="mt-1 text-slate-500 text-xs">
        CPF, senha e matrículas não são alterados por este formulário.
      </p>

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
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            E-mail
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Telefone
            <input
              type="tel"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="Opcional"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Status da conta
            <select
              value={statusConta}
              onChange={(event) =>
                setStatusConta(event.target.value as UserStatus)
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="ativo">Ativo</option>
              <option value="pendente_ativacao">Pendente de ativação</option>
              <option value="inativo">Inativo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </label>
        </div>

        <CoordinatorFormActions
          submitLabel={isSubmitting ? "Salvando..." : "Salvar alterações"}
          onCancel={onCancel}
          disabled={isSubmitting}
        />
      </form>
    </section>
  );
};
