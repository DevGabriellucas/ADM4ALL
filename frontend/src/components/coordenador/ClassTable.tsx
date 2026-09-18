"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  definirCancelamentoDaTurmaAction,
  excluirTurmaAction,
} from "@/app/coordenador/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import {
  Notificacao,
  PRAZO_PARA_LIMPAR_AVISO,
} from "@/components/shared/Notificacao";
import type { ClassGroup } from "@/types/coordinator";

interface ClassTableProps {
  classes: ClassGroup[];
}

const classStatusInfo: Record<
  ClassGroup["status"],
  {
    label: string;
    tone: "green" | "amber" | "red" | "blue";
  }
> = {
  planejada: { label: "Planejada", tone: "amber" },
  em_andamento: { label: "Em andamento", tone: "blue" },
  concluida: { label: "Concluída", tone: "green" },
  encerrada: { label: "Encerrada", tone: "red" },
  cancelada: { label: "Cancelada", tone: "red" },
};

// O status da turma e calculado (sem aluno = Planejada, com aluno = Em
// andamento, cronograma cumprido = Concluída). Cancelar e a unica decisao que
// continua sendo da coordenacao, e por isso e um botao na linha, ao lado de
// Excluir, em vez de uma opcao no formulario de edicao.
interface PedidoDeCancelamento {
  turma: ClassGroup;
  cancelar: boolean;
}

export const ClassTable = ({ classes }: ClassTableProps) => {
  const [deletingClass, setDeletingClass] = useState<ClassGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pedidoDeCancelamento, setPedidoDeCancelamento] =
    useState<PedidoDeCancelamento | null>(null);
  const [isMudandoCancelamento, setIsMudandoCancelamento] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(
      () => setFeedback(null),
      PRAZO_PARA_LIMPAR_AVISO,
    );
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleCancelamento = async () => {
    if (!pedidoDeCancelamento) return;

    const { turma, cancelar } = pedidoDeCancelamento;
    setIsMudandoCancelamento(true);
    const resultado = await definirCancelamentoDaTurmaAction(
      turma.id,
      cancelar,
    );
    setIsMudandoCancelamento(false);
    setPedidoDeCancelamento(null);
    setFeedback({
      tipo: resultado.sucesso ? "sucesso" : "erro",
      mensagem: resultado.mensagem,
    });
  };

  const handleDelete = async () => {
    if (!deletingClass) return;
    setIsDeleting(true);
    const resultado = await excluirTurmaAction(deletingClass.id);
    setIsDeleting(false);
    setDeletingClass(null);
    setFeedback({
      tipo: resultado.sucesso ? "sucesso" : "erro",
      mensagem: resultado.mensagem,
    });
  };

  return (
    <>
      {feedback && (
        <Notificacao tipo={feedback.tipo}>{feedback.mensagem}</Notificacao>
      )}
      {pedidoDeCancelamento && (
        <ConfirmDialog
          title={
            pedidoDeCancelamento.cancelar
              ? "Cancelar turma?"
              : "Reativar turma?"
          }
          description={
            pedidoDeCancelamento.cancelar
              ? `A turma "${pedidoDeCancelamento.turma.nome}" fica marcada como cancelada e sai da contagem do curso. As aulas, as matrículas e a frequência continuam guardadas, e a turma pode ser reativada depois.`
              : `A turma "${pedidoDeCancelamento.turma.nome}" volta a valer, e o status dela passa a ser calculado de novo pelos alunos e pelas aulas.`
          }
          confirmLabel={
            isMudandoCancelamento
              ? "Salvando..."
              : pedidoDeCancelamento.cancelar
                ? "Cancelar turma"
                : "Reativar"
          }
          cancelLabel="Voltar"
          tone={pedidoDeCancelamento.cancelar ? "danger" : "neutral"}
          isLoading={isMudandoCancelamento}
          onCancel={() => setPedidoDeCancelamento(null)}
          onConfirm={handleCancelamento}
        />
      )}
      {deletingClass && (
        <ConfirmDialog
          title="Excluir turma?"
          description={`A turma "${deletingClass.nome}" será apagada do sistema, junto com as aulas, os materiais e os vínculos com instrutores. As matrículas serão preservadas sem a turma vinculada. Turma que já teve chamada lançada não pode ser excluída, para que o histórico de frequência dos alunos não se perca.`}
          confirmLabel={isDeleting ? "Excluindo..." : "Excluir"}
          cancelLabel="Cancelar"
          tone="danger"
          isLoading={isDeleting}
          onCancel={() => setDeletingClass(null)}
          onConfirm={handleDelete}
        />
      )}
      <section
        aria-labelledby="classes-table-heading"
        className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
      >
        <div className="mb-4">
          <h2
            id="classes-table-heading"
            className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
          >
            Turmas cadastradas
          </h2>
          <p className="mt-1 text-slate-500 text-xs">
            Consulte vínculos, períodos e situação das turmas.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-5xl border-separate border-spacing-0 border-slate-200 text-left text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Nome da turma
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Curso
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Instrutores
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Alunos
                </th>
                <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                  Período letivo
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
              {classes.map((classGroup) => {
                const status = classStatusInfo[classGroup.status];

                return (
                  <tr key={classGroup.id}>
                    <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                      {classGroup.nome}
                      {/* Turmas do mesmo curso e período têm nome idêntico; o
                        código é o único jeito de distinguir uma da outra. */}
                      {classGroup.codigo && (
                        <span className="mt-0.5 block font-normal text-slate-500 text-xs">
                          {classGroup.codigo}
                        </span>
                      )}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {classGroup.curso}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {classGroup.instrutores || "-"}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {classGroup.alunos}
                    </td>
                    <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                      {classGroup.periodoLetivo || "-"}
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
                          href={`/coordenador/turmas/${classGroup.id}`}
                          className="cursor-pointer font-semibold text-brand-dark text-xs transition-colors hover:text-navy-900"
                        >
                          Visualizar
                        </Link>
                        {classGroup.status === "cancelada" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPedidoDeCancelamento({
                                turma: classGroup,
                                cancelar: false,
                              })
                            }
                            className="cursor-pointer font-semibold text-emerald-700 text-xs transition-colors hover:text-emerald-900"
                          >
                            Reativar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setPedidoDeCancelamento({
                                turma: classGroup,
                                cancelar: true,
                              })
                            }
                            className="cursor-pointer font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeletingClass(classGroup)}
                          className="cursor-pointer font-semibold text-red-700 text-xs transition-colors hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {classes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-slate-500 text-sm"
                  >
                    Nenhuma turma cadastrada.
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
