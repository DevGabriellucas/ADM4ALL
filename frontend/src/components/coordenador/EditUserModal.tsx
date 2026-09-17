"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useEffect, useState } from "react";
import { atualizarUsuarioAction } from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { Notificacao } from "@/components/shared/Notificacao";
import type { BaseUser, UserRole } from "@/types/coordinator";
import { formatarCpf } from "@/utils/cpf";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: BaseUser | null;
}

interface UserFormData {
  nome: string;
  email: string;
  cpf: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  administrador: "Administrador",
  coordenador: "Coordenador",
  instrutor: "Instrutor",
  aluno: "Aluno",
};

const getUserStatusInfo = (status: BaseUser["status"]) => {
  if (status === "ativo") {
    return { label: "Ativo", tone: "green" as const };
  }
  if (status === "pendente_ativacao") {
    return { label: "Pendente de ativação", tone: "amber" as const };
  }
  if (status === "bloqueado") {
    return { label: "Bloqueado", tone: "red" as const };
  }
  return { label: "Inativo", tone: "slate" as const };
};

export const EditUserModal = ({
  isOpen,
  onClose,
  user,
}: EditUserModalProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>({
    nome: "",
    email: "",
    cpf: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
      });
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) {
    return null;
  }

  const status = getUserStatusInfo(user.status);

  const handleClose = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const resultado = await atualizarUsuarioAction(user.id, formData);
    setIsSubmitting(false);

    if (!resultado.sucesso) {
      setErrorMessage(resultado.mensagem);
      return;
    }

    setSuccessMessage(resultado.mensagem);
    router.refresh();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-slate-200 border-b px-5 py-4">
          <div>
            <h2
              id="edit-user-modal-title"
              className="font-semibold text-lg text-slate-950"
            >
              Editar usuário
            </h2>
            <p className="mt-1 text-slate-600 text-sm">
              Atualize os dados básicos de acesso.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar modal"
            className="rounded-md px-2 py-1 font-semibold text-slate-500 text-xl leading-none transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="block font-medium text-slate-500 text-xs">
                Perfil
              </span>
              <span className="mt-1 block font-semibold text-slate-900 text-sm">
                {ROLE_LABELS[user.role]}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="block font-medium text-slate-500 text-xs">
                Status
              </span>
              <span className="mt-2 block">
                <CoordinatorStatusBadge
                  label={status.label}
                  tone={status.tone}
                />
              </span>
            </div>
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
              <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm md:col-span-2">
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
                      email: event.target.value.toLowerCase(),
                    })
                  }
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
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
                />
              </label>
            </div>

            <CoordinatorFormActions
              submitLabel={isSubmitting ? "Salvando..." : "Salvar alterações"}
              onCancel={handleClose}
              disabled={isSubmitting}
            />
          </form>
        </div>
      </div>
    </div>
  );
};
