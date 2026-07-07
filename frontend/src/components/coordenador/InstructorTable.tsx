"use client";

import Link from "next/link";
import { useState } from "react";
import {
  atualizarStatusInstrutorAction,
  reenviarAtivacaoInstrutorAction,
} from "@/app/coordenador/actions";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { ResendActivationConfirmModal } from "@/components/coordenador/ResendActivationConfirmModal";
import { StatusChangeConfirmModal } from "@/components/coordenador/StatusChangeConfirmModal";
import type { Instructor, UserStatus } from "@/types/coordinator";

interface InstructorTableProps {
  instructors: Instructor[];
}

interface StatusChangeRequest {
  instructorId: string;
  targetStatus: UserStatus;
  title: string;
  description: string;
  confirmLabel: string;
}

const getInstructorStatusInfo = (status: Instructor["status"]) => {
  if (status === "ativo") {
    return { label: "Ativo", tone: "green" as const };
  }

  if (status === "pendente_ativacao") {
    return { label: "Pendente de ativacao", tone: "amber" as const };
  }

  if (status === "bloqueado") {
    return { label: "Bloqueado", tone: "red" as const };
  }

  return { label: "Inativo", tone: "slate" as const };
};

export const InstructorTable = ({ instructors }: InstructorTableProps) => {
  const [resendingInstructorId, setResendingInstructorId] = useState<
    string | null
  >(null);
  const [instructorPendingResend, setInstructorPendingResend] = useState<
    string | null
  >(null);
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

  const handleResendActivation = async () => {
    if (!instructorPendingResend) {
      return;
    }

    const instructorId = instructorPendingResend;
    setResendingInstructorId(instructorId);
    setActivationMessage(null);
    setActivationError(null);

    const result = await reenviarAtivacaoInstrutorAction(instructorId);
    setResendingInstructorId(null);
    setInstructorPendingResend(null);

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
      statusChange.instructorId,
      statusChange.targetStatus,
    );
    setIsChangingStatus(false);
    setStatusChange(null);

    if (!result.sucesso) {
      setStatusError(result.mensagem);
      return;
    }

    setStatusMessage(result.mensagem);
  };

  return (
    <section
      aria-labelledby="instructors-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="instructors-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Instrutores cadastrados
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Acompanhe vinculos, acessos ativos e convites enviados.
        </p>
      </div>

      {activationMessage && (
        <output
          aria-live="polite"
          className="mb-4 block rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm"
        >
          {activationMessage}
        </output>
      )}

      {activationError && (
        <output
          aria-live="polite"
          className="mb-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
        >
          {activationError}
        </output>
      )}

      {statusMessage && (
        <output
          aria-live="polite"
          className="mb-4 block rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm"
        >
          {statusMessage}
        </output>
      )}

      {statusError && (
        <output
          aria-live="polite"
          className="mb-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
        >
          {statusError}
        </output>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-4xl border-separate border-spacing-0 border-slate-200 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Nome
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                E-mail
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Telefone
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Status
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Turmas vinculadas
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Acoes
              </th>
            </tr>
          </thead>

          <tbody>
            {instructors.map((instructor) => {
              const status = getInstructorStatusInfo(instructor.status);

              return (
                <tr key={instructor.id}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {instructor.nome}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {instructor.email}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {instructor.telefone ?? "Nao informado"}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {instructor.turmasVinculadas}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <div className="flex min-w-max flex-wrap gap-x-3 gap-y-2">
                      <Link
                        href={`/coordenador/instrutores/${instructor.id}`}
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Visualizar
                      </Link>
                      <Link
                        href={`/coordenador/instrutores/${instructor.id}?modo=editar`}
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Editar
                      </Link>
                      {instructor.status === "pendente_ativacao" && (
                        <button
                          type="button"
                          disabled={resendingInstructorId === instructor.id}
                          onClick={() =>
                            setInstructorPendingResend(instructor.id)
                          }
                          className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F] disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          {resendingInstructorId === instructor.id
                            ? "Reenviando..."
                            : "Reenviar ativacao"}
                        </button>
                      )}
                      {(instructor.status === "ativo" ||
                        instructor.status === "pendente_ativacao") && (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusChange({
                              instructorId: instructor.id,
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
                          className="font-semibold text-red-600 text-xs transition-colors hover:text-red-800"
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
                              instructorId: instructor.id,
                              targetStatus: "ativo",
                              title: "Reativar instrutor?",
                              description:
                                "O instrutor voltara a acessar o sistema e podera ser selecionado em novas turmas.",
                              confirmLabel: "Reativar",
                            })
                          }
                          className="font-semibold text-emerald-700 text-xs transition-colors hover:text-emerald-900"
                        >
                          Reativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {instructors.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum instrutor cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {instructorPendingResend && (
        <ResendActivationConfirmModal
          isLoading={resendingInstructorId === instructorPendingResend}
          onCancel={() => setInstructorPendingResend(null)}
          onConfirm={handleResendActivation}
        />
      )}

      {statusChange && (
        <StatusChangeConfirmModal
          title={statusChange.title}
          description={statusChange.description}
          confirmLabel={statusChange.confirmLabel}
          isLoading={isChangingStatus}
          onCancel={() => setStatusChange(null)}
          onConfirm={handleStatusChange}
        />
      )}
    </section>
  );
};
