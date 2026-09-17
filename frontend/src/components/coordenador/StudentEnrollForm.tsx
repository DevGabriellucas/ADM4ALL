"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useEffect, useState } from "react";
import {
  listarTurmasParaMatriculaAction,
  vincularAlunoTurmaAction,
} from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import { Notificacao } from "@/components/shared/Notificacao";
import type { EnrollmentClassOption } from "@/types/coordinator";

interface StudentEnrollFormProps {
  studentId: string;
  onCancel: () => void;
}

export const StudentEnrollForm = ({
  studentId,
  onCancel,
}: StudentEnrollFormProps) => {
  const router = useRouter();
  const [classes, setClasses] = useState<EnrollmentClassOption[]>([]);
  const [classId, setClassId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    listarTurmasParaMatriculaAction().then((result) => {
      if (!isActive) {
        return;
      }

      setIsLoading(false);
      if (!result.sucesso) {
        setErrorMessage(result.mensagem);
        return;
      }

      setClasses(result.turmas);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result = await vincularAlunoTurmaAction(studentId, classId);
    setIsSubmitting(false);

    if (!result.sucesso) {
      setErrorMessage(result.mensagem);
      return;
    }

    setSuccessMessage(result.mensagem);
    setClassId("");
    router.refresh();
  };

  return (
    <section
      aria-labelledby="student-enroll-heading"
      className="rounded-lg border border-[#C9D2E6] bg-white p-5 shadow-sm"
    >
      <h2
        id="student-enroll-heading"
        className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
      >
        Vincular à turma
      </h2>
      <p className="mt-1 text-slate-500 text-xs">
        Selecione uma turma planejada ou em andamento.
      </p>

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
        <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
          Turma
          <select
            required
            value={classId}
            disabled={isLoading || isSubmitting}
            onChange={(event) => setClassId(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {isLoading ? "Carregando turmas..." : "Selecione uma turma"}
            </option>
            {classes.map((classGroup) => (
              <option key={classGroup.id} value={classGroup.id}>
                {classGroup.nome} — {classGroup.curso}
              </option>
            ))}
          </select>
        </label>

        {!isLoading && classes.length === 0 && !errorMessage && (
          <p className="mt-3 text-slate-500 text-sm">
            Nenhuma turma disponível para matrícula.
          </p>
        )}

        <CoordinatorFormActions
          submitLabel={isSubmitting ? "Vinculando..." : "Vincular aluno"}
          onCancel={onCancel}
          disabled={
            isLoading || isSubmitting || classes.length === 0 || !classId
          }
        />
      </form>
    </section>
  );
};
