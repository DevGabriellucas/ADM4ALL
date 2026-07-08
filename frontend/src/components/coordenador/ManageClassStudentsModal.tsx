"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adicionarAlunoNaTurmaAction,
  buscarAlunosDaTurmaAction,
  buscarAlunosDisponiveisAction,
  removerAlunoDaTurmaAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { ClassGroup, Student } from "@/types/coordinator";

interface ManageClassStudentsModalProps {
  classGroup: ClassGroup;
  onClose: () => void;
}

export const ManageClassStudentsModal = ({
  classGroup,
  onClose,
}: ManageClassStudentsModalProps) => {
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [confirmRemoveStudent, setConfirmRemoveStudent] = useState<{
    matriculaId: string;
    nome: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [enrolledResult, allResult] = await Promise.all([
        buscarAlunosDaTurmaAction(classGroup.id),
        buscarAlunosDisponiveisAction(),
      ]);
      setEnrolledStudents(enrolledResult.students);
      setAllStudents(allResult.students);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Falha ao carregar os alunos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [classGroup.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const enrolledIds = new Set(enrolledStudents.map((s) => s.id));
  const notEnrolled = allStudents.filter((s) => !enrolledIds.has(s.id));

  const handleAdd = async () => {
    if (!selectedStudentId) return;

    setIsAdding(true);
    setAddError(null);

    const resultado = await adicionarAlunoNaTurmaAction(
      classGroup.id,
      selectedStudentId,
    );

    setIsAdding(false);

    if (!resultado.sucesso) {
      setAddError(resultado.mensagem);
      return;
    }

    setSelectedStudentId("");
    await loadData();
  };

  const handleRemove = async (matriculaId: string) => {
    setIsRemoving(matriculaId);
    setRemoveError(null);

    const resultado = await removerAlunoDaTurmaAction(
      classGroup.id,
      matriculaId,
    );

    setIsRemoving(null);

    if (!resultado.sucesso) {
      setRemoveError(resultado.mensagem);
      return;
    }

    await loadData();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-students-title"
      aria-describedby="manage-students-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
    >
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div>
          <h2
            id="manage-students-title"
            className="font-semibold text-slate-900 text-xl"
          >
            Gerenciar alunos
          </h2>
          <p
            id="manage-students-description"
            className="mt-1 text-slate-500 text-sm"
          >
            {classGroup.nome}
          </p>
        </div>

        {loadError && (
          <output
            aria-live="polite"
            className="mt-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
          >
            {loadError}
          </output>
        )}

        {addError && (
          <output
            aria-live="polite"
            className="mt-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
          >
            {addError}
          </output>
        )}

        {removeError && (
          <output
            aria-live="polite"
            className="mt-4 block rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
          >
            {removeError}
          </output>
        )}

        {isLoading ? (
          <div className="mt-5 animate-pulse space-y-3">
            <div className="h-10 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-100" />
          </div>
        ) : (
          <>
            <div className="mt-5">
              <div className="flex items-end gap-3">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 text-sm outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
                >
                  <option value="">Selecione um aluno</option>
                  {notEnrolled.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedStudentId || isAdding}
                  onClick={handleAdd}
                  className="h-11 cursor-pointer rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAdding ? "Adicionando..." : "Adicionar"}
                </button>
              </div>

              {notEnrolled.length === 0 && (
                <p className="mt-2 text-slate-500 text-xs">
                  Todos os alunos já estão vinculados a esta turma.
                </p>
              )}
            </div>

            <div className="mt-5">
              <h3 className="font-semibold text-slate-700 text-sm">
                Alunos vinculados ({enrolledStudents.length})
              </h3>

              {enrolledStudents.length === 0 ? (
                <p className="mt-2 text-slate-500 text-sm">
                  Nenhum aluno vinculado a esta turma.
                </p>
              ) : (
                <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                  {enrolledStudents.map((student) => (
                    <li
                      key={student.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {student.nome}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {student.email}
                        </p>
                      </div>
                      {student.matriculaId ? (
                        <button
                          type="button"
                          disabled={isRemoving === student.matriculaId}
                          onClick={() =>
                            setConfirmRemoveStudent({
                              matriculaId: student.matriculaId!,
                              nome: student.nome,
                            })
                          }
                          className="cursor-pointer font-semibold text-red-600 text-xs transition-colors hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRemoving === student.matriculaId
                            ? "Removendo..."
                            : "Remover"}
                        </button>
                      ) : (
                        <span className="font-semibold text-slate-400 text-xs">
                          Sem matricula
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 cursor-pointer rounded-lg border border-slate-300 px-4 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>

        {confirmRemoveStudent && (
          <ConfirmDialog
            title="Remover aluno da turma?"
            description={`A matrícula de ${confirmRemoveStudent.nome} será cancelada nesta turma. O cadastro do aluno será preservado.`}
            confirmLabel="Remover aluno"
            cancelLabel="Cancelar"
            tone="danger"
            isLoading={isRemoving === confirmRemoveStudent.matriculaId}
            onCancel={() => setConfirmRemoveStudent(null)}
            onConfirm={() => {
              handleRemove(confirmRemoveStudent.matriculaId);
              setConfirmRemoveStudent(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
