"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { atualizarCursoAction } from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import { Notificacao } from "@/components/shared/Notificacao";
import type { Course } from "@/types/coordinator";
import { somenteDigitos } from "@/utils/numeros";

interface EditCourseFormProps {
  course: Course;
  onCancel: () => void;
  onSuccess: () => void;
}

interface CourseFormData {
  nome: string;
  descricao: string;
  cargaHoraria: string;
  periodoLetivo: string;
}

// Sem campo de status: quem decide o status do curso sao as turmas dele, e a
// tela so exibe o resultado.
export const EditCourseForm = ({
  course,
  onCancel,
  onSuccess,
}: EditCourseFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    nome: course.nome,
    descricao: course.descricao,
    cargaHoraria: String(course.cargaHoraria),
    periodoLetivo: course.periodoLetivo,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    setErrorMessage(null);
    onCancel();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const resultado = await atualizarCursoAction(course.id, {
      nome: formData.nome,
      descricao: formData.descricao,
      cargaHoraria: Number(formData.cargaHoraria),
      periodoLetivo: formData.periodoLetivo,
    });

    setIsSubmitting(false);

    if (!resultado.sucesso) {
      setErrorMessage(resultado.mensagem);
      return;
    }

    router.refresh();
    onSuccess();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-course-title"
      aria-describedby="edit-course-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
    >
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div>
          <h2
            id="edit-course-title"
            className="font-semibold text-slate-900 text-xl"
          >
            Editar curso
          </h2>
          <p
            id="edit-course-description"
            className="mt-1 text-slate-500 text-sm"
          >
            Altere os dados do curso e salve as alterações.
          </p>
        </div>

        {errorMessage && (
          <Notificacao tipo="erro" className="mt-4">
            {errorMessage}
          </Notificacao>
        )}

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Nome do curso
              <input
                required
                type="text"
                value={formData.nome}
                onChange={(event) =>
                  setFormData({ ...formData, nome: event.target.value })
                }
                placeholder="Ex.: Assistente Administrativo"
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
              />
            </label>

            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Carga horária
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={formData.cargaHoraria}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    cargaHoraria: somenteDigitos(event.target.value),
                  })
                }
                placeholder="Ex.: 40"
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
              />
            </label>

            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Descrição
              <textarea
                required
                rows={4}
                value={formData.descricao}
                onChange={(event) =>
                  setFormData({ ...formData, descricao: event.target.value })
                }
                placeholder="Descreva o objetivo e o conteúdo do curso"
                className="resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
              />
            </label>

            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Período letivo
              <input
                required
                type="text"
                value={formData.periodoLetivo}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    periodoLetivo: event.target.value,
                  })
                }
                placeholder="2026.1"
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
              />
              <span className="font-normal text-slate-400 text-xs">
                Use o formato ano.semestre, por exemplo 2026.1 ou 2026.2.
              </span>
            </label>
          </div>

          <CoordinatorFormActions
            submitLabel={isSubmitting ? "Salvando..." : "Salvar alterações"}
            onCancel={handleCancel}
            disabled={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
};
