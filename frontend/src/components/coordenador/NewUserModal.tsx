"use client";

import { useEffect, useState } from "react";
import { NewInstructorForm } from "@/components/coordenador/NewInstructorForm";
import { NewStudentForm } from "@/components/coordenador/NewStudentForm";
import type { ClassGroup, Course } from "@/types/coordinator";

type UserType = "coordenador" | "instrutor" | "aluno";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  classes: ClassGroup[];
}

const USER_TYPE_OPTIONS: Array<{
  type: UserType;
  title: string;
  description: string;
}> = [
  {
    type: "coordenador",
    title: "Coordenador",
    description: "Acesso administrativo para gestão acadêmica.",
  },
  {
    type: "instrutor",
    title: "Instrutor",
    description: "Convite para ministrar turmas e acompanhar alunos.",
  },
  {
    type: "aluno",
    title: "Aluno",
    description: "Convite com vínculo inicial a curso e turma.",
  },
];

export const NewUserModal = ({
  isOpen,
  onClose,
  courses,
  classes,
}: NewUserModalProps) => {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedType(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-user-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-slate-200 border-b px-5 py-4">
          <div>
            <h2
              id="new-user-modal-title"
              className="font-semibold text-lg text-slate-950"
            >
              Novo usuário
            </h2>
            <p className="mt-1 text-slate-600 text-sm">
              Escolha o tipo de acesso que deseja criar.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar modal"
            className="cursor-pointer rounded-md px-2 py-1 font-semibold text-slate-500 text-xl leading-none transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          {!selectedType && (
            <section aria-labelledby="user-type-heading">
              <h3
                id="user-type-heading"
                className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
              >
                Que tipo de usuário deseja criar?
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {USER_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setSelectedType(option.type)}
                    className="cursor-pointer rounded-lg border border-[#D5DDEC] bg-white p-4 text-left transition-colors hover:border-brand-medium hover:bg-brand-light/20 focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2"
                  >
                    <span className="block font-semibold text-slate-950">
                      {option.title}
                    </span>
                    <span className="mt-2 block text-slate-600 text-sm leading-relaxed">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedType === "aluno" && (
            <div className="flex flex-col gap-y-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-fit cursor-pointer font-semibold text-brand-dark text-sm transition-colors hover:text-[#23275F]"
              >
                Voltar
              </button>
              <NewStudentForm
                isOpen={isOpen}
                onCancel={handleClose}
                courses={courses}
                classes={classes}
              />
            </div>
          )}

          {selectedType === "instrutor" && (
            <div className="flex flex-col gap-y-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-fit cursor-pointer font-semibold text-brand-dark text-sm transition-colors hover:text-[#23275F]"
              >
                Voltar
              </button>
              <NewInstructorForm isOpen={isOpen} onCancel={handleClose} />
            </div>
          )}

          {selectedType === "coordenador" && (
            <section
              aria-labelledby="new-coordinator-heading"
              className="rounded-lg border border-[#C9D2E6] bg-white p-5"
            >
              <h3
                id="new-coordinator-heading"
                className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
              >
                Novo coordenador
              </h3>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                A criação de coordenadores será implementada na próxima etapa.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-10 cursor-pointer rounded-lg border border-slate-300 px-4 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-10 cursor-pointer rounded-lg bg-brand-dark px-4 font-semibold text-sm text-white transition-colors hover:bg-[#292E68]"
                >
                  Fechar
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
