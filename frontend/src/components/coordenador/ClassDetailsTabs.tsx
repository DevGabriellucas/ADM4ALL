"use client";

import Link from "next/link";
import { useState } from "react";
import { baixarMaterialTurmaAction } from "@/app/coordenador/actions";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import { getMatriculaStatusInfo } from "@/constants/matriculaStatus";
import type {
  AttendanceSummary,
  CertificateDisplayStatus,
  CertificateRecord,
  ClassMaterial,
  Lesson,
  Student,
} from "@/types/coordinator";
import { downloadBase64File } from "@/utils/downloadFile";
import { getCertificateStatus as resolveCertificateStatus } from "@/utils/getCertificateStatus";
import { getErrorMessage } from "@/utils/getErrorMessage";

type ClassDetailsTab =
  | "alunos"
  | "cronograma"
  | "frequencia"
  | "materiais"
  | "certificados";

interface ClassDetailsTabsProps {
  turmaId: string;
  students: Student[];
  lessons: Lesson[];
  attendance: AttendanceSummary[];
  materials: ClassMaterial[];
  certificates: CertificateRecord[];
}

const TABS: Array<{ id: ClassDetailsTab; label: string }> = [
  { id: "alunos", label: "Alunos" },
  { id: "cronograma", label: "Cronograma" },
  { id: "frequencia", label: "Frequência" },
  { id: "materiais", label: "Materiais" },
  { id: "certificados", label: "Certificados" },
];

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(date),
  );
};

const getLessonStatus = (status: Lesson["status"]) => {
  if (status === "realizada") {
    return { label: "Realizada", tone: "green" as const };
  }
  if (status === "cancelada") {
    return { label: "Cancelada", tone: "red" as const };
  }
  return { label: "Planejada", tone: "amber" as const };
};

const getCertificateStatus = (status: CertificateDisplayStatus) => {
  if (status === "emitido") {
    return { label: "Emitido", tone: "greenStrong" as const };
  }
  if (status === "nao_elegivel") {
    return { label: "Não elegível", tone: "slate" as const };
  }
  if (status === "elegivel") {
    return { label: "Elegível", tone: "greenSoft" as const };
  }
  if (status === "cancelado") {
    return { label: "Cancelado", tone: "red" as const };
  }
  return { label: "Pendente", tone: "amber" as const };
};

export const ClassDetailsTabs = ({
  turmaId,
  students,
  lessons,
  attendance,
  materials,
  certificates,
}: ClassDetailsTabsProps) => {
  const [activeTab, setActiveTab] = useState<ClassDetailsTab>("alunos");
  const [baixandoId, setBaixandoId] = useState<string | null>(null);
  const [erroDownload, setErroDownload] = useState<string | null>(null);

  // O arquivo vem pela rota autenticada, que confere o vinculo com a turma.
  // Linkar o arquivo estatico direto deixava o material publico.
  const baixarMaterial = async (materialId: string) => {
    setBaixandoId(materialId);
    setErroDownload(null);
    try {
      downloadBase64File(await baixarMaterialTurmaAction(turmaId, materialId));
    } catch (error) {
      setErroDownload(getErrorMessage(error));
    } finally {
      setBaixandoId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-[#D5DDEC] bg-white shadow-sm">
      <div
        role="tablist"
        aria-label="Detalhes da turma"
        className="flex overflow-x-auto border-slate-200 border-b bg-slate-50 px-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-12 min-w-max border-b-2 px-4 font-semibold text-xs transition-colors ${
              activeTab === tab.id
                ? "border-brand-dark text-brand-dark"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="p-5">
        {activeTab === "alunos" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Nome
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    E-mail
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
                  const status = student.statusMatricula
                    ? getMatriculaStatusInfo(student.statusMatricula)
                    : { label: "Sem matrícula", tone: "slate" as const };

                  return (
                    <tr key={student.id}>
                      <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                        {student.nome}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {student.email}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {student.frequencia}%
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3">
                        <CoordinatorStatusBadge
                          label={status.label}
                          tone={status.tone}
                        />
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3">
                        <Link
                          href={`/coordenador/alunos/${student.id}`}
                          className="font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900"
                        >
                          Visualizar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      Nenhum aluno encontrado nesta turma.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "cronograma" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Aula
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Data
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Tema
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => {
                  const status = getLessonStatus(lesson.status);

                  return (
                    <tr key={lesson.id}>
                      <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                        Aula {lesson.numeroAula}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {formatDate(lesson.data)}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {lesson.titulo}
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
                {lessons.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      Nenhuma aula cadastrada nesta turma.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "frequencia" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Aluno
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Presenças
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Faltas
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Frequência
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={`${record.aluno}-${record.turma}`}>
                    <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                      {record.aluno}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {record.presencas}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {record.faltas}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 font-semibold text-slate-800">
                      {record.frequencia}%
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      Nenhum registro de frequência nesta turma.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "materiais" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Nome do material
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Tipo
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Data
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Tamanho
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Aula
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Visibilidade
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => {
                  return (
                    <tr key={material.id}>
                      <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                        {material.nome}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {material.tipo}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {formatDate(material.data)}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {material.tamanho}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {material.aulaTitulo ?? "Geral"}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {material.visibilidade === "oculto"
                          ? "Oculto"
                          : "Visivel"}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3">
                        {material.urlArquivo ? (
                          <button
                            type="button"
                            onClick={() => baixarMaterial(material.id)}
                            disabled={baixandoId === material.id}
                            className="cursor-pointer font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {baixandoId === material.id
                              ? "Abrindo…"
                              : "Visualizar"}
                          </button>
                        ) : (
                          <span className="font-semibold text-slate-400 text-xs">
                            Sem arquivo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {materials.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      Nenhum material publicado nesta turma.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {erroDownload && (
              <p role="alert" className="mt-3 text-red-700 text-xs">
                {erroDownload}
              </p>
            )}
          </div>
        )}

        {activeTab === "certificados" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Aluno
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Frequência
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Status do certificado
                  </th>
                  <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => {
                  const certificateStatus =
                    resolveCertificateStatus(certificate);
                  const status = getCertificateStatus(certificateStatus);

                  return (
                    <tr key={`${certificate.aluno}-${certificate.turma}`}>
                      <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                        {certificate.aluno}
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                        {certificate.frequencia}%
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3">
                        <CoordinatorStatusBadge
                          label={status.label}
                          tone={status.tone}
                        />
                      </td>
                      <td className="border-slate-100 border-b px-3 py-3">
                        <Link
                          href="/coordenador/certificados"
                          className="font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900"
                        >
                          {certificateStatus === "emitido"
                            ? "Visualizar"
                            : "Analisar"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {certificates.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      Nenhum certificado relacionado a esta turma.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
