"use client";

import Link from "next/link";
import { useState } from "react";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { StudentEditForm } from "@/components/coordenador/StudentEditForm";
import { getMatriculaStatusInfo } from "@/constants/matriculaStatus";
import type { StudentDetail, UserStatus } from "@/types/coordinator";

interface StudentDetailContentProps {
  student: StudentDetail;
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
  if (!date) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(date),
  );
};

export const StudentDetailContent = ({
  student,
}: StudentDetailContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const accountStatus = accountStatusInfo[student.statusConta];

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
            <p className="mt-2 text-slate-600 text-sm">{student.email}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            aria-expanded={isEditing}
            className="h-11 rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68]"
          >
            {isEditing ? "Fechar edição" : "Editar dados"}
          </button>
        </div>
      </header>

      {isEditing && (
        <StudentEditForm
          student={student}
          onCancel={() => setIsEditing(false)}
        />
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 text-sm tracking-[0.2em]">
            Dados pessoais
          </h2>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500 text-xs">CPF</dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {student.cpf ?? "Não informado"}
              </dd>
            </div>
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
              </tr>
            </thead>
            <tbody>
              {student.matriculas.map((enrollment) => {
                const status = getMatriculaStatusInfo(enrollment.status);

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
                  </tr>
                );
              })}

              {student.matriculas.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
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
    </>
  );
};
