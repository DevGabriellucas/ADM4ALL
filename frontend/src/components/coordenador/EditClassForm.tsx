"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { atualizarTurmaAction } from "@/app/coordenador/actions";
import { CoordinatorFormActions } from "@/components/coordenador/CoordinatorFormActions";
import { Notificacao } from "@/components/shared/Notificacao";
import type {
  ClassGroup,
  ClassStatus,
  Course,
  Instructor,
} from "@/types/coordinator";

interface EditClassFormProps {
  classGroup: ClassGroup;
  courses: Course[];
  instructors: Instructor[];
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditClassForm = ({
  classGroup,
  courses,
  instructors,
  onCancel,
  onSuccess,
}: EditClassFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    curso: classGroup.curso,
    nome: classGroup.nome,
    instrutoresSelecionados: classGroup.instrutores.split(", ").filter(Boolean),
    periodoLetivo: classGroup.periodoLetivo,
    capacidade: String(classGroup.capacidade > 0 ? classGroup.capacidade : 30),
    status: classGroup.status,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeInstructors = instructors.filter(
    (instructor) => instructor.status === "ativo",
  );

  const toggleInstrutor = (nome: string) => {
    setFormData((prev) => {
      const selected = prev.instrutoresSelecionados.includes(nome)
        ? prev.instrutoresSelecionados.filter((n) => n !== nome)
        : [...prev.instrutoresSelecionados, nome];

      return { ...prev, instrutoresSelecionados: selected };
    });
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (formData.instrutoresSelecionados.length === 0) {
      setIsSubmitting(false);
      setErrorMessage("Selecione pelo menos um instrutor.");
      return;
    }

    // Com o campo em texto, quem digita "trinta" mandaria NaN para a API e
    // levaria de volta um erro de banco em vez de uma frase legivel.
    const capacidade = Number(formData.capacidade.trim());

    if (!Number.isInteger(capacidade) || capacidade < 1) {
      setIsSubmitting(false);
      setErrorMessage(
        "Informe a capacidade como um número inteiro maior que zero.",
      );
      return;
    }

    const resultado = await atualizarTurmaAction(classGroup.id, {
      nome: formData.nome,
      curso: formData.curso,
      instrutores: formData.instrutoresSelecionados,
      periodoLetivo: formData.periodoLetivo,
      capacidade,
      status: formData.status as ClassGroup["status"],
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
      aria-labelledby="edit-class-title"
      aria-describedby="edit-class-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
    >
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div>
          <h2
            id="edit-class-title"
            className="font-semibold text-slate-900 text-xl"
          >
            Editar turma
          </h2>
          <p
            id="edit-class-description"
            className="mt-1 text-slate-500 text-sm"
          >
            Altere os dados da turma e salve as alterações.
          </p>
        </div>

        {errorMessage && (
          <Notificacao tipo="erro" className="mt-4">
            {errorMessage}
          </Notificacao>
        )}

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Curso
              <select
                required
                value={formData.curso}
                onChange={(event) =>
                  setFormData({ ...formData, curso: event.target.value })
                }
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.nome}>
                    {course.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Nome da turma
              <input
                required
                type="text"
                value={formData.nome}
                onChange={(event) =>
                  setFormData({ ...formData, nome: event.target.value })
                }
                placeholder="Ex.: ADM-2026-03"
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
              />
            </label>

            <div className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm md:col-span-2">
              Instrutores
              {activeInstructors.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  Nenhum instrutor ativo disponível.
                </p>
              ) : (
                <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-300 bg-white p-3">
                  {activeInstructors.map((instructor) => {
                    const checked = formData.instrutoresSelecionados.includes(
                      instructor.nome,
                    );

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

            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Capacidade
              {/* Campo de texto, sem as setinhas do type="number", que davam
                  para a coordenacao um contador que ela nao usava. O valor
                  continua indo como numero para a API, e o banco tem
                  CHECK (capacidade > 0) — por isso a validacao no submit. */}
              <input
                required
                type="text"
                inputMode="numeric"
                value={formData.capacidade}
                onChange={(event) =>
                  setFormData({ ...formData, capacidade: event.target.value })
                }
                placeholder="Ex.: 30"
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
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
              <span className="text-slate-400 text-xs">
                Use o formato ano.semestre, por exemplo 2026.1 ou 2026.2.
              </span>
            </label>

            <label className="flex flex-col gap-y-2 font-medium text-slate-700 text-sm">
              Status
              <select
                value={formData.status}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    status: event.target.value as ClassStatus,
                  })
                }
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition-colors focus:border-brand-medium focus:ring-2 focus:ring-brand-light/30"
              >
                {/* "Encerrada" saiu da lista: virou sinonimo de "Concluída" e
                    as duas na mesma tela so faziam a coordenacao escolher
                    entre nomes diferentes para o mesmo fim de turma. */}
                <option value="planejada">Planejada</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </label>
          </div>

          <CoordinatorFormActions
            submitLabel={isSubmitting ? "Salvando..." : "Salvar alterações"}
            onCancel={onCancel}
            disabled={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
};
