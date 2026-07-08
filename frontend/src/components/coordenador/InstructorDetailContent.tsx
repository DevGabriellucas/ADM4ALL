"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  atualizarStatusInstrutorAction,
  reenviarAtivacaoInstrutorAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { InstructorEditForm } from "@/components/coordenador/InstructorEditForm";
import { ResendActivationConfirmModal } from "@/components/coordenador/ResendActivationConfirmModal";
import type {
  ClassStatus,
  InstructorDetail,
  UserStatus,
} from "@/types/coordinator";

interface InstructorDetailContentProps {
  instructor: InstructorDetail;
  initialMode?: "editar";
}

interface StatusChangeRequest {
  targetStatus: UserStatus;
  title: string;
  description: string;
  confirmLabel: string;
}

const accountStatusInfo: Record<
  UserStatus,
  {
    label: string;
    tone: "green" | "amber" | "slate" | "red";
  }
> = {
  ativo: { label: "Ativo", tone: "green" },
  pendente_ativacao: { label: "Pendente de ativacao", tone: "amber" },
  inativo: { label: "Inativo", tone: "slate" },
  bloqueado: { label: "Bloqueado", tone: "red" },
};

const classStatusInfo: Record<
  ClassStatus,
  {
    label: string;
    tone: "green" | "amber" | "slate" | "red";
  }
> = {
  planejada: { label: "Planejada", tone: "amber" },
  em_andamento: { label: "Em andamento", tone: "green" },
  concluida: { label: "Concluída", tone: "green" },
  encerrada: { label: "Encerrada", tone: "red" },
  cancelada: { label: "Cancelada", tone: "red" },
};

const formatDate = (date: string | null) => {
  if (!date) return "Nao informado";

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(date),
  );
};

export const InstructorDetailContent = ({
  instructor,
  initialMode,
}: InstructorDetailContentProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(initialMode === "editar");
  const [isResendingActivation, setIsResendingActivation] = useState(false);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(
    null,
  );
  const [activationError, setActivationError] = useState<string | null>(null);
  const [statusChange, setStatusChange] = useState<StatusChangeRequest | null>(
    null,
  );
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const accountStatus = accountStatusInfo[instructor.status];

  const handleResendActivation = async () => {
    setIsResendingActivation(true);
    setActivationMessage(null);
    setActivationError(null);

    const result = await reenviarAtivacaoInstrutorAction(instructor.id);
    setIsResendingActivation(false);
    setIsResendModalOpen(false);

    if (!result.sucesso) {
      setActivationError(result.mensagem);
      return;
    }

    setActivationMessage(result.mensagem);
  };

  const handleStatusChange = async () => {
    if (!statusChange) {
      return;
    }

    setIsChangingStatus(true);
    setStatusMessage(null);
    setStatusError(null);

    const result = await atualizarStatusInstrutorAction(
      instructor.id,
      statusChange.targetStatus,
    );
    setIsChangingStatus(false);
    setStatusChange(null);

    if (!result.sucesso) {
      setStatusError(result.mensagem);
      return;
    }

    setStatusMessage(result.mensagem);
    router.refresh();
  };

  return (
    <>
      <header className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <Link
          href="/coordenador/instrutores"
          className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
        >
          Voltar para instrutores
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-semibold text-2xl text-slate-950">
                {instructor.nome}
              </h1>
              <CoordinatorStatusBadge
                label={accountStatus.label}
                tone={accountStatus.tone}
              />
            </div>
            <p className="mt-2 break-all text-slate-600 text-sm">
              {instructor.email}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsEditing((current) => !current)}
              aria-expanded={isEditing}
              className="h-11 rounded-lg border border-brand-dark px-5 font-semibold text-brand-dark text-sm transition-colors hover:bg-slate-50"
            >
              {isEditing ? "Fechar edicao" : "Editar dados"}
            </button>

            {instructor.status === "pendente_ativacao" && (
              <button
                type="button"
                disabled={isResendingActivation}
                onClick={() => setIsResendModalOpen(true)}
                className="h-11 rounded-lg bg-amber-700 px-5 font-semibold text-sm text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResendingActivation ? "Reenviando..." : "Reenviar ativacao"}
              </button>
            )}

            {(instructor.status === "ativo" ||
              instructor.status === "pendente_ativacao") && (
              <button
                type="button"
                onClick={() =>
                  setStatusChange({
                    targetStatus: "inativo",
                    title:
                      instructor.status === "pendente_ativacao"
                        ? "Desativar convite?"
                        : "Desativar instrutor?",
                    description:
                      instructor.status === "pendente_ativacao"
                        ? "O convite deixara de liberar acesso para este instrutor."
                        : "O instrutor perdera acesso e nao podera ser selecionado em novas turmas.",
                    confirmLabel: "Desativar",
                  })
                }
                className="h-11 rounded-lg bg-red-700 px-5 font-semibold text-sm text-white transition-colors hover:bg-red-800"
              >
                Desativar
              </button>
            )}

            {(instructor.status === "inativo" ||
              instructor.status === "bloqueado") && (
              <button
                type="button"
                onClick={() =>
                  setStatusChange({
                    targetStatus: "ativo",
                    title: "Reativar instrutor?",
                    description:
                      "O instrutor voltara a acessar o sistema e podera ser selecionado em novas turmas.",
                    confirmLabel: "Reativar",
                  })
                }
                className="h-11 rounded-lg bg-emerald-700 px-5 font-semibold text-sm text-white transition-colors hover:bg-emerald-800"
              >
                Reativar
              </button>
            )}
          </div>
        </div>

        {activationMessage && (
          <output
            aria-live="polite"
            className="mt-4 block rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm"
          >
            {activationMessage}
          </output>
        )}

        {activationError && (
          <output
            aria-live="polite"
            className="mt-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
          >
            {activationError}
          </output>
        )}

        {statusMessage && (
          <output
            aria-live="polite"
            className="mt-4 block rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm"
          >
            {statusMessage}
          </output>
        )}

        {statusError && (
          <output
            aria-live="polite"
            className="mt-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
          >
            {statusError}
          </output>
        )}
      </header>

      {isEditing && (
        <InstructorEditForm
          instructor={instructor}
          onCancel={() => setIsEditing(false)}
        />
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
            Dados de contato
          </h2>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500 text-xs">Telefone</dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {instructor.telefone ?? "Nao informado"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Data de cadastro
              </dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {formatDate(instructor.dataCriacao)}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
            Dados profissionais
          </h2>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Area de atuacao
              </dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {instructor.areaAtuacao ?? "Nao informado"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">Formacao</dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {instructor.formacao ?? "Nao informado"}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
          Turmas vinculadas
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-3xl border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Turma
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Curso
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Periodo
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Alunos
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Status
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {instructor.turmas.map((turma) => {
                const status = classStatusInfo[turma.status];

                return (
                  <tr key={turma.id}>
                    <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                      {turma.nome}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {turma.curso}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {formatDate(turma.dataInicio)} -{" "}
                      {formatDate(turma.dataTermino)}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {turma.alunos}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3">
                      <CoordinatorStatusBadge
                        label={status.label}
                        tone={status.tone}
                      />
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3">
                      <Link
                        href={`/coordenador/turmas/${turma.id}`}
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Visualizar
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {instructor.turmas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhuma turma vinculada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isResendModalOpen && (
        <ResendActivationConfirmModal
          isLoading={isResendingActivation}
          onCancel={() => setIsResendModalOpen(false)}
          onConfirm={handleResendActivation}
        />
      )}

      {statusChange && (
        <ConfirmDialog
          title={statusChange.title}
          description={statusChange.description}
          confirmLabel={statusChange.confirmLabel}
          tone={statusChange.targetStatus === "ativo" ? "neutral" : "danger"}
          isLoading={isChangingStatus}
          onCancel={() => setStatusChange(null)}
          onConfirm={handleStatusChange}
        />
      )}
    </>
  );
};
