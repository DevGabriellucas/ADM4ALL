import type { AlunoDashboard } from "@/types/aluno";

interface AlunoCompletionMessageProps {
  curso: AlunoDashboard["curso"];
}

export const AlunoCompletionMessage = ({
  curso,
}: AlunoCompletionMessageProps) => {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="status" foi solicitado explicitamente para a mensagem de conclusao.
    <section
      className="mx-auto max-w-3xl text-center font-medium text-xs leading-6 tracking-[0.25em]"
      role="status"
    >
      Parabens! Voce concluiu o curso {curso} com sucesso. Seu certificado ja
      esta disponivel na plataforma.
    </section>
  );
};
