"use client";

import Link from "next/link";
import { useState } from "react";
import {
  atualizarStatusInstrutorAction,
  excluirInstrutorAction,
  reenviarAtivacaoInstrutorAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { ResendActivationConfirmModal } from "@/components/coordenador/ResendActivationConfirmModal";
import { StatusChangeConfirmModal } from "@/components/coordenador/StatusChangeConfirmModal";
import { Notificacao } from "@/components/shared/Notificacao";
import { getContaStatusInfo } from "@/constants/contaStatus";
import type { Instructor, UserStatus } from "@/types/coordinator";
import { formatarTelefone } from "@/utils/telefone";

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

// Desativar um convite ainda pendente e desativar um instrutor com acesso
// terminam no mesmo status, mas quem le a confirmacao precisa reconhecer o que
// vai perder.
const pedidoDeDesativacao = (instructor: Instructor): StatusChangeRequest => ({
  instructorId: instructor.id,
  targetStatus: "inativo",
  title:
    instructor.status === "pendente_ativacao"
      ? "Desativar convite?"
      : "Desativar instrutor?",
  description:
    instructor.status === "pendente_ativacao"
      ? "O convite deixará de liberar acesso para este instrutor."
      : "O instrutor perderá o acesso e não poderá ser selecionado em novas turmas. As turmas atuais dele continuam existindo.",
  confirmLabel: "Desativar",
});

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
  const [instructorPendingDeletion, setInstructorPendingDeletion] =
    useState<Instructor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!instructorPendingDeletion) {
      return;
    }

    setIsDeleting(true);
    setStatusMessage(null);
    setStatusError(null);

    const result = await excluirInstrutorAction(instructorPendingDeletion.id);

    setIsDeleting(false);
    setInstructorPendingDeletion(null);

    if (!result.sucesso) {
      setStatusError(result.mensagem);
      return;
    }

    setStatusMessage(result.mensagem);
  };

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
        <Notificacao tipo="sucesso" className="mb-4">
          {activationMessage}
        </Notificacao>
      )}

      {activationError && (
        <Notificacao tipo="erro" className="mb-4">
          {activationError}
        </Notificacao>
      )}

      {statusMessage && (
        <Notificacao tipo="sucesso" className="mb-4">
          {statusMessage}
        </Notificacao>
      )}

      {statusError && (
        <Notificacao tipo="erro" className="mb-4">
          {statusError}
        </Notificacao>
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
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {instructors.map((instructor) => {
              const status = getContaStatusInfo(instructor.status);

              return (
                <tr key={instructor.id}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {instructor.nome}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {instructor.email}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {instructor.telefone
                      ? formatarTelefone(instructor.telefone)
                      : "Não informado"}
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
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900"
                      >
                        Visualizar
                      </Link>

                      {instructor.status === "pendente_ativacao" && (
                        <button
                          type="button"
                          disabled={resendingInstructorId === instructor.id}
                          onClick={() =>
                            setInstructorPendingResend(instructor.id)
                          }
                          className="font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900 disabled:cursor-not-allowed disabled:text-slate-400"
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
                            setStatusChange(pedidoDeDesativacao(instructor))
                          }
                          className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
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
                      <button
                        type="button"
                        onClick={() => setInstructorPendingDeletion(instructor)}
                        className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                      >
                        Excluir
                      </button>
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

      {instructorPendingDeletion && (
        <ConfirmDialog
          title="Excluir instrutor?"
          description={`${instructorPendingDeletion.nome} será apagado do sistema e desvinculado das turmas dele. As turmas e as aulas continuam existindo. Essa ação não pode ser desfeita.`}
          confirmLabel={isDeleting ? "Excluindo..." : "Excluir"}
          cancelLabel="Cancelar"
          tone="danger"
          isLoading={isDeleting}
          onCancel={() => setInstructorPendingDeletion(null)}
          onConfirm={handleDelete}
        />
      )}

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
