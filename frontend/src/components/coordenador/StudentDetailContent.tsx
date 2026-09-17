"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  atualizarStatusMatriculaAction,
  cancelarMatriculaAction,
  reenviarAtivacaoAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { ResendActivationConfirmModal } from "@/components/coordenador/ResendActivationConfirmModal";
import { StudentEditForm } from "@/components/coordenador/StudentEditForm";
import { StudentEnrollForm } from "@/components/coordenador/StudentEnrollForm";
import { Notificacao } from "@/components/shared/Notificacao";
import { getMatriculaStatusInfo } from "@/constants/matriculaStatus";
import type {
  EditableEnrollmentStatus,
  StudentDetail,
  UserStatus,
} from "@/types/coordinator";

interface StudentDetailContentProps {
  student: StudentDetail;
  initialMode?: "editar" | "vincular";
}

interface EnrollmentCancelTarget {
  classId: string;
  enrollmentId: string;
}

const accountStatusInfo: Record<
  UserStatus,
  {
    label: string;
    tone: "green" | "amber" | "slate" | "red";
  }
> = {
  ativo: { label: "Ativo", tone: "green" },
  pendente_ativacao: { label: "Pendente de ativação", tone: "amber" },
  inativo: { label: "Inativo", tone: "slate" },
  bloqueado: { label: "Bloqueado", tone: "red" },
};

const formatDate = (date: string | null) => {
  if (!date) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(date),
  );
};

export const StudentDetailContent = ({
  student,
  initialMode,
}: StudentDetailContentProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(initialMode === "editar");
  const [isEnrolling, setIsEnrolling] = useState(initialMode === "vincular");
  const [cancelingEnrollmentId, setCancelingEnrollmentId] = useState<
    string | null
  >(null);
  const [enrollmentParaCancelar, setEnrollmentParaCancelar] =
    useState<EnrollmentCancelTarget | null>(null);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, EditableEnrollmentStatus>
  >({});
  const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(
    null,
  );
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [isResendingActivation, setIsResendingActivation] = useState(false);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(
    null,
  );
  const [activationError, setActivationError] = useState<string | null>(null);
  const accountStatus = accountStatusInfo[student.statusConta];

  const handleResendActivation = async () => {
    setIsResendingActivation(true);
    setActivationMessage(null);
    setActivationError(null);

    const result = await reenviarAtivacaoAction(student.id);
    setIsResendingActivation(false);
    setIsResendModalOpen(false);

    if (!result.sucesso) {
      setActivationError(result.mensagem);
      return;
    }

    setActivationMessage(result.mensagem);
  };

  const handleCancelEnrollment = async (
    classId: string,
    enrollmentId: string,
  ) => {
    setEnrollmentParaCancelar(null);
    setCancelingEnrollmentId(enrollmentId);
    setEnrollmentMessage(null);
    setEnrollmentError(null);

    const result = await cancelarMatriculaAction(
      student.id,
      classId,
      enrollmentId,
    );
    setCancelingEnrollmentId(null);

    if (!result.sucesso) {
      setEnrollmentError(result.mensagem);
      return;
    }

    setEnrollmentMessage(result.mensagem);
    router.refresh();
  };

  const handleUpdateEnrollmentStatus = async (
    enrollmentId: string,
    currentStatus: EditableEnrollmentStatus,
  ) => {
    const status = selectedStatuses[enrollmentId] ?? currentStatus;
    setSavingStatusId(enrollmentId);
    setEnrollmentMessage(null);
    setEnrollmentError(null);

    const result = await atualizarStatusMatriculaAction(
      student.id,
      enrollmentId,
      status,
    );
    setSavingStatusId(null);

    if (!result.sucesso) {
      setEnrollmentError(result.mensagem);
      return;
    }

    setEnrollmentMessage(result.mensagem);
    router.refresh();
  };

  return (
    <>
      <header className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <Link
          href="/coordenador/alunos"
          className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
        >
          Voltar para alunos
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-semibold text-2xl text-slate-950">
                {student.nome}
              </h1>
              <CoordinatorStatusBadge
                label={accountStatus.label}
                tone={accountStatus.tone}
              />
            </div>
            <p className="mt-2 break-all text-slate-600 text-sm">
              {student.email}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setIsEnrolling(false);
                setIsEditing((current) => !current);
              }}
              aria-expanded={isEditing}
              className="h-11 rounded-lg border border-brand-dark px-5 font-semibold text-brand-dark text-sm transition-colors hover:bg-slate-50"
            >
              {isEditing ? "Fechar edição" : "Editar dados"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setIsEnrolling((current) => !current);
              }}
              aria-expanded={isEnrolling}
              className="h-11 rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68]"
            >
              {isEnrolling ? "Fechar vínculo" : "Vincular à turma"}
            </button>
          </div>
        </div>
      </header>

      {student.statusConta === "pendente_ativacao" && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-amber-950 text-sm">
                Aluno com ativação pendente
              </h2>
              <p className="mt-1 text-amber-800 text-xs">
                Envie um novo link caso o convite anterior tenha expirado.
              </p>
            </div>
            <button
              type="button"
              disabled={isResendingActivation}
              onClick={() => setIsResendModalOpen(true)}
              className="h-10 rounded-lg bg-amber-700 px-4 font-semibold text-sm text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResendingActivation ? "Reenviando..." : "Reenviar ativação"}
            </button>
          </div>

          {activationMessage && (
            <Notificacao tipo="sucesso" className="mt-4">
              {activationMessage}
            </Notificacao>
          )}

          {activationError && (
            <Notificacao tipo="erro" className="mt-4">
              {activationError}
            </Notificacao>
          )}
        </section>
      )}

      {isResendModalOpen && (
        <ResendActivationConfirmModal
          isLoading={isResendingActivation}
          onCancel={() => setIsResendModalOpen(false)}
          onConfirm={handleResendActivation}
        />
      )}

      {isEditing && (
        <StudentEditForm
          student={student}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {isEnrolling && (
        <StudentEnrollForm
          studentId={student.id}
          onCancel={() => setIsEnrolling(false)}
        />
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
            Dados pessoais
          </h2>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500 text-xs">Telefone</dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {student.telefone ?? "Não informado"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Data de nascimento
              </dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {formatDate(student.dataNascimento)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Data de cadastro
              </dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {formatDate(student.dataCriacao)}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
            Dados acadêmicos
          </h2>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500 text-xs">RGM</dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {student.rgm ?? "Não informado"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Curso UNIPÊ
              </dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {student.cursoUnipe ?? "Não informado"}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
          Matrículas
        </h2>

        {enrollmentMessage && (
          <Notificacao tipo="sucesso" className="mt-4">
            {enrollmentMessage}
          </Notificacao>
        )}

        {enrollmentError && (
          <Notificacao tipo="erro" className="mt-4">
            {enrollmentError}
          </Notificacao>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-3xl border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Curso
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Turma
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Matrícula
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Frequência
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Status
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Alterar status
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {student.matriculas.map((enrollment) => {
                const status = getMatriculaStatusInfo(enrollment.status);
                const classId = enrollment.turmaId;
                const editableStatus =
                  enrollment.status === "cancelado" ? null : enrollment.status;
                const selectedStatus = editableStatus
                  ? (selectedStatuses[enrollment.id] ?? editableStatus)
                  : null;

                return (
                  <tr key={enrollment.id}>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {enrollment.curso ?? "Não informado"}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {enrollment.turma ?? "Não vinculada"}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {formatDate(enrollment.dataMatricula)}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {enrollment.frequencia}%
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3">
                      <CoordinatorStatusBadge
                        label={status.label}
                        tone={status.tone}
                      />
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3">
                      {editableStatus && selectedStatus ? (
                        <div className="flex min-w-max items-center gap-2">
                          <select
                            value={selectedStatus}
                            disabled={savingStatusId === enrollment.id}
                            onChange={(event) =>
                              setSelectedStatuses((current) => ({
                                ...current,
                                [enrollment.id]: event.target
                                  .value as EditableEnrollmentStatus,
                              }))
                            }
                            aria-label={`Status da matrícula de ${student.nome}`}
                            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-slate-900 text-xs outline-none focus:border-brand-medium disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <option value="em_andamento">Em andamento</option>
                            <option value="aprovado">Aprovado</option>
                            <option value="reprovado_falta">
                              Reprovado por falta
                            </option>
                          </select>
                          <button
                            type="button"
                            disabled={
                              savingStatusId === enrollment.id ||
                              selectedStatus === enrollment.status
                            }
                            onClick={() =>
                              handleUpdateEnrollmentStatus(
                                enrollment.id,
                                editableStatus,
                              )
                            }
                            className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F] disabled:cursor-not-allowed disabled:text-slate-400"
                          >
                            {savingStatusId === enrollment.id
                              ? "Salvando..."
                              : "Salvar"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Indisponível
                        </span>
                      )}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3">
                      {enrollment.status !== "cancelado" && classId ? (
                        <button
                          type="button"
                          disabled={cancelingEnrollmentId === enrollment.id}
                          onClick={() =>
                            setEnrollmentParaCancelar({
                              classId,
                              enrollmentId: enrollment.id,
                            })
                          }
                          className="font-semibold text-red-600 text-xs transition-colors hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {cancelingEnrollmentId === enrollment.id
                            ? "Cancelando..."
                            : "Cancelar matrícula"}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Indisponível
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {student.matriculas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhuma matrícula encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {enrollmentParaCancelar && (
        <ConfirmDialog
          title="Cancelar matrícula?"
          description="A matrícula será marcada como cancelada e o aluno deixará de aparecer como ativo nesta turma."
          confirmLabel="Cancelar matrícula"
          tone="danger"
          isLoading={
            cancelingEnrollmentId === enrollmentParaCancelar.enrollmentId
          }
          onCancel={() => setEnrollmentParaCancelar(null)}
          onConfirm={() =>
            handleCancelEnrollment(
              enrollmentParaCancelar.classId,
              enrollmentParaCancelar.enrollmentId,
            )
          }
        />
      )}
    </>
  );
};
