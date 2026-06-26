"use client";

import type { SubmitEvent } from "react";
import { useState } from "react";
import type { BaseUser, ProcessStatus } from "@/types/coordinator";

interface NewProcessFormProps {
  users: BaseUser[];
  isOpen: boolean;
  onCancel: () => void;
}

interface ProcessFormData {
  nome: string;
  responsavel: string;
  status: ProcessStatus;
  observacoes: string;
}

const INITIAL_FORM_DATA: ProcessFormData = {
  nome: "",
  responsavel: "",
  status: "aberto",
  observacoes: "",
};

export const NewProcessForm = ({
  users,
  isOpen,
  onCancel,
}: NewProcessFormProps) => {
  const [formData, setFormData] = useState<ProcessFormData>(INITIAL_FORM_DATA);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableUsers = users.filter(
    (user) => user.status === "ativo" && user.role !== "aluno",
  );

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setSuccessMessage(null);
    onCancel();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    // MOCK TEMPORARIO: a API de cadastro substituirá esta confirmação local.
    setSuccessMessage(`Dados do processo "${formData.nome}" validados.`);
    setFormData(INITIAL_FORM_DATA);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-labelledby="new-process-heading"
      className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm"
    >
      <div>
        <h2
          id="new-process-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Novo processo
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Registre os dados iniciais e defina um responsável.
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
            Nome do processo
            <input
              required
              type="text"
              value={formData.nome}
              onChange={(event) =>
                setFormData({ ...formData, nome: event.target.value })
              }
              placeholder="Ex.: Revisão de matrículas"
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Responsável
            <select
              required
              value={formData.responsavel}
              onChange={(event) =>
                setFormData({ ...formData, responsavel: event.target.value })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="">Selecione um responsável</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.nome}>
                  {user.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
            Status
            <select
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value as ProcessStatus,
                })
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            >
              <option value="aberto">Pendente</option>
              <option value="em_analise">Em andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>

          <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm md:col-span-2">
            Observações
            <textarea
              rows={4}
              value={formData.observacoes}
              onChange={(event) =>
                setFormData({ ...formData, observacoes: event.target.value })
              }
              placeholder="Inclua informações relevantes para o acompanhamento"
              className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
            />
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
            Salvar processo
          </button>
        </div>
      </form>
    </section>
  );
};
