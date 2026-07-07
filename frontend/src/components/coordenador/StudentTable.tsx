"use client";

import Link from "next/link";
import { useState } from "react";
import {
  atualizarStatusContaAction,
  reenviarAtivacaoAction,
} from "@/app/coordenador/actions";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { ResendActivationConfirmModal } from "@/components/coordenador/ResendActivationConfirmModal";
import { StatusChangeConfirmModal } from "@/components/coordenador/StatusChangeConfirmModal";
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
                    <span
                      className={
                        student.frequencia < 75 &&
                        student.statusConta !== "pendente_ativacao"
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
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Visualizar
                      </Link>
                      <Link
                        href={`/coordenador/alunos/${student.id}?modo=editar`}
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/coordenador/alunos/${student.id}?modo=vincular`}
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Vincular à turma
                      </Link>
                      {student.statusConta === "pendente_ativacao" && (
                        <button
                          type="button"
                          disabled={resendingStudentId === student.id}
                          onClick={() => setStudentPendingResend(student.id)}
                          className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F] disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          {resendingStudentId === student.id
                            ? "Reenviando..."
                            : "Reenviar ativação"}
                        </button>
                      )}
                      {student.statusConta === "ativo" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setStatusChange({
                                studentId: student.id,
                                targetStatus: "inativo",
                                title: "Desativar aluno?",
                                description:
                                  "Este aluno perderá o acesso ao sistema.",
                                confirmLabel: "Desativar",
                              })
                            }
                            className="font-semibold text-red-600 text-xs transition-colors hover:text-red-800"
                          >
                            Desativar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setStatusChange({
                                studentId: student.id,
                                targetStatus: "bloqueado",
                                title: "Bloquear aluno?",
                                description:
                                  "O acesso deste aluno será bloqueado.",
                                confirmLabel: "Bloquear",
                              })
                            }
                            className="font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                          >
                            Bloquear
                          </button>
                        </>
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
                                  "O acesso deste aluno será bloqueado.",
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
                                "O acesso deste aluno será liberado novamente.",
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
