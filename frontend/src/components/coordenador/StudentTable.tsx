"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  atualizarStatusContaAction,
  excluirAlunoAction,
  reenviarAtivacaoAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { ResendActivationConfirmModal } from "@/components/coordenador/ResendActivationConfirmModal";
import { StatusChangeConfirmModal } from "@/components/coordenador/StatusChangeConfirmModal";
import {
  Notificacao,
  PRAZO_PARA_LIMPAR_AVISO,
} from "@/components/shared/Notificacao";
import { getMatriculaStatusInfo } from "@/constants/matriculaStatus";
import type { Student, UserStatus } from "@/types/coordinator";

interface StudentTableProps {
  students: Student[];
}

interface StatusChangeRequest {
  studentId: string;
  targetStatus: UserStatus;
  title: string;
  description: string;
  confirmLabel: string;
}

const getStudentStatusInfo = (student: Student) => {
  if (student.statusConta === "pendente_ativacao") {
    return { label: "Pendente de ativação", tone: "amber" as const };
  }

  if (student.statusConta === "inativo") {
    return { label: "Inativo", tone: "slate" as const };
  }

  if (student.statusConta === "bloqueado") {
    return { label: "Bloqueado", tone: "red" as const };
  }

  if (student.statusMatricula) {
    return getMatriculaStatusInfo(student.statusMatricula);
  }

  return { label: "Sem matrícula", tone: "slate" as const };
};

export const StudentTable = ({ students }: StudentTableProps) => {
  const [resendingStudentId, setResendingStudentId] = useState<string | null>(
    null,
  );
  const [studentPendingResend, setStudentPendingResend] = useState<
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
  const [studentPendingDeletion, setStudentPendingDeletion] =
    useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (
      !activationMessage &&
      !activationError &&
      !statusMessage &&
      !statusError
    ) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setActivationMessage(null);
      setActivationError(null);
      setStatusMessage(null);
      setStatusError(null);
    }, PRAZO_PARA_LIMPAR_AVISO);
    return () => window.clearTimeout(timeout);
  }, [activationMessage, activationError, statusMessage, statusError]);

  const handleDelete = async () => {
    if (!studentPendingDeletion) {
      return;
    }

    setIsDeleting(true);
    setStatusMessage(null);
    setStatusError(null);

    const result = await excluirAlunoAction(studentPendingDeletion.id);

    setIsDeleting(false);
    setStudentPendingDeletion(null);

    if (!result.sucesso) {
      setStatusError(result.mensagem);
      return;
    }

    setStatusMessage(result.mensagem);
  };

  const handleResendActivation = async () => {
    if (!studentPendingResend) {
      return;
    }

    const studentId = studentPendingResend;
    setResendingStudentId(studentId);
    setActivationMessage(null);
    setActivationError(null);

    const result = await reenviarAtivacaoAction(studentId);
    setResendingStudentId(null);
    setStudentPendingResend(null);

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

    const result = await atualizarStatusContaAction(
      statusChange.studentId,
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
      aria-labelledby="students-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="students-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Alunos cadastrados
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Consulte vínculos, frequência e situação de acesso.
        </p>
      </div>

      {activationMessage && (
        <Notificacao tipo="sucesso">{activationMessage}</Notificacao>
      )}

      {activationError && (
        <Notificacao tipo="erro">{activationError}</Notificacao>
      )}

      {statusMessage && (
        <Notificacao tipo="sucesso">{statusMessage}</Notificacao>
      )}

      {statusError && <Notificacao tipo="erro">{statusError}</Notificacao>}

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
                Turma
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Frequência
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Status
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const status = getStudentStatusInfo(student);

              return (
                <tr key={student.id}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {student.nome}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {student.email}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {student.turma}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    {/* Vermelho so no desfecho ja decidido. Pintar por faixa
                        ("abaixo de 75%") marcava a lista inteira no comeco do
                        periodo, porque a frequencia se acumula e todo mundo
                        comeca baixo. */}
                    <span
                      className={
                        student.statusMatricula === "reprovado_falta"
                          ? "font-semibold text-red-700"
                          : "text-slate-700"
                      }
                    >
                      {student.statusConta === "pendente_ativacao" ||
                      !student.statusMatricula
                        ? "Não iniciada"
                        : `${student.frequencia}%`}
                    </span>
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <div className="flex min-w-max flex-wrap gap-x-3 gap-y-2">
                      <Link
                        href={`/coordenador/alunos/${student.id}`}
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900"
                      >
                        Visualizar
                      </Link>

                      {student.statusConta === "pendente_ativacao" && (
                        <button
                          type="button"
                          disabled={resendingStudentId === student.id}
                          onClick={() => setStudentPendingResend(student.id)}
                          className="font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          {resendingStudentId === student.id
                            ? "Reenviando..."
                            : "Reenviar ativação"}
                        </button>
                      )}
                      {student.statusConta === "ativo" && (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusChange({
                              studentId: student.id,
                              targetStatus: "bloqueado",
                              title: "Bloquear aluno?",
                              description:
                                "O acesso deste aluno será bloqueado e o CPF dele ficará impedido de criar outra conta.",
                              confirmLabel: "Bloquear",
                            })
                          }
                          className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                        >
                          Bloquear
                        </button>
                      )}
                      {student.statusConta === "inativo" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setStatusChange({
                                studentId: student.id,
                                targetStatus: "ativo",
                                title: "Reativar aluno?",
                                description:
                                  "O acesso deste aluno será liberado novamente.",
                                confirmLabel: "Reativar",
                              })
                            }
                            className="font-semibold text-emerald-700 text-xs transition-colors hover:text-emerald-900"
                          >
                            Reativar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setStatusChange({
                                studentId: student.id,
                                targetStatus: "bloqueado",
                                title: "Bloquear aluno?",
                                description:
                                  "O acesso deste aluno será bloqueado e o CPF dele ficará impedido de criar outra conta.",
                                confirmLabel: "Bloquear",
                              })
                            }
                            className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                          >
                            Bloquear
                          </button>
                        </>
                      )}
                      {student.statusConta === "bloqueado" && (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusChange({
                              studentId: student.id,
                              targetStatus: "ativo",
                              title: "Reativar aluno?",
                              description:
                                "O acesso deste aluno será liberado novamente e o CPF sairá da lista de bloqueio.",
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
                        onClick={() => setStudentPendingDeletion(student)}
                        className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {students.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum aluno cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {studentPendingDeletion && (
        <ConfirmDialog
          title="Excluir aluno?"
          description={`${studentPendingDeletion.nome} será apagado do sistema, junto com a matrícula, a frequência e o certificado dele.`}
          confirmLabel={isDeleting ? "Excluindo..." : "Excluir"}
          cancelLabel="Cancelar"
          tone="danger"
          isLoading={isDeleting}
          onCancel={() => setStudentPendingDeletion(null)}
          onConfirm={handleDelete}
        />
      )}

      {studentPendingResend && (
        <ResendActivationConfirmModal
          isLoading={resendingStudentId === studentPendingResend}
          onCancel={() => setStudentPendingResend(null)}
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
