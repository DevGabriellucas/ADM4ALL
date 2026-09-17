import Link from "next/link";

/**
 * As quatro telas de turma da coordenacao dependem de existir turma cadastrada.
 * Sem nenhuma, a tela explica o caminho em vez de abrir vazia.
 */
export const ClassWorkspaceEmptyCard = () => {
  return (
    <section className="rounded-lg bg-white p-6 text-slate-600 text-sm leading-6 shadow-sm">
      Nenhuma turma cadastrada ainda. Crie a primeira em{" "}
      <Link
        href="/coordenador/turmas"
        className="font-medium text-brand-dark underline underline-offset-2"
      >
        Turmas
      </Link>{" "}
      para lançar presença, acompanhar a frequência, montar o cronograma e
      publicar materiais.
    </section>
  );
};
