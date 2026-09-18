"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { atualizarTurmaAction } from "@/app/coordenador/actions";
import { Notificacao } from "@/components/shared/Notificacao";
import type { ClassGroup, Instructor } from "@/types/coordinator";

interface AddInstructorToClassModalProps {
  classGroup: ClassGroup;
  instructors: Instructor[];
  onClose: () => void;
}

export const AddInstructorToClassModal = ({
  classGroup,
  instructors,
  onClose,
}: AddInstructorToClassModalProps) => {
  const router = useRouter();
  const currentInstructors = classGroup.instrutores.split(", ").filter(Boolean);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeInstructors = instructors.filter(
    (instructor) => instructor.status === "ativo",
  );

  const toggleInstrutor = (nome: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nome)) {
        next.delete(nome);
      } else {
        next.add(nome);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    const novosNomes = Array.from(selectedIds);
    if (novosNomes.length === 0) {
      setErrorMessage("Selecione pelo menos um instrutor.");
      return;
    }

    const todosInstrutores = [
      ...currentInstructors,
      ...novosNomes.filter((n) => !currentInstructors.includes(n)),
    ];

    setIsSubmitting(true);
    setErrorMessage(null);

    const resultado = await atualizarTurmaAction(classGroup.id, {
      nome: classGroup.nome,
      curso: classGroup.curso,
      instrutores: todosInstrutores,
      periodoLetivo: classGroup.periodoLetivo,
      capacidade: classGroup.capacidade > 0 ? classGroup.capacidade : 30,
      status: classGroup.status,
    });

    setIsSubmitting(false);

    if (!resultado.sucesso) {
      setErrorMessage(resultado.mensagem);
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-instructor-title"
      aria-describedby="add-instructor-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div>
          <h2
            id="add-instructor-title"
            className="font-semibold text-slate-900 text-xl"
          >
            Adicionar instrutor
          </h2>
          <p
            id="add-instructor-description"
            className="mt-1 text-slate-500 text-sm"
          >
            {classGroup.nome}
          </p>
        </div>

        {errorMessage && (
          <Notificacao tipo="erro" className="mt-4">
            {errorMessage}
          </Notificacao>
        )}

        <div className="mt-4">
          <p className="font-medium text-slate-700 text-sm">
            Instrutores atuais
          </p>
          <p className="text-slate-600 text-sm">
            {currentInstructors.length > 0
              ? currentInstructors.join(", ")
              : "Nenhum instrutor vinculado"}
          </p>
        </div>

        <div className="mt-3">
          <p className="font-medium text-slate-700 text-sm">
            Instrutores disponíveis
          </p>
          {activeInstructors.filter((i) => !currentInstructors.includes(i.nome))
            .length === 0 ? (
            <p className="text-slate-500 text-sm">
              Todos os instrutores ativos já estão vinculados.
            </p>
          ) : (
            <div className="mt-1 max-h-44 overflow-y-auto rounded-lg border border-slate-300 bg-white p-3">
              {activeInstructors
                .filter((i) => !currentInstructors.includes(i.nome))
                .map((instructor) => {
                  const checked = selectedIds.has(instructor.nome);

                  return (
                    <label
                      key={instructor.id}
                      className="flex cursor-pointer items-center gap-x-2 rounded px-2 py-1.5 font-normal transition-colors hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleInstrutor(instructor.nome)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-dark focus:ring-brand-light/30"
                      />
                      <span className="text-slate-900 text-sm">
                        {instructor.nome}
                      </span>
                    </label>
                  );
                })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 cursor-pointer rounded-lg border border-slate-300 px-4 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isSubmitting || selectedIds.size === 0}
            className="h-10 cursor-pointer rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Salvando..." : "Adicionar instrutores"}
          </button>
        </div>
      </div>
    </div>
  );
};
