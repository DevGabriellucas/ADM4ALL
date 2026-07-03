import type { AlunoDashboard } from "@/types/aluno";

interface AlunoCompletionMessageProps {
  curso: AlunoDashboard["curso"];
  certificadoDisponivel: boolean;
  certificadoUrl: string | null;
}

export const AlunoCompletionMessage = ({
  curso,
  certificadoDisponivel,
  certificadoUrl,
}: AlunoCompletionMessageProps) => {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="status" foi solicitado explicitamente para a mensagem de conclusao.
    <section
      className="mx-auto max-w-3xl text-center font-medium text-xs leading-6 tracking-[0.25em]"
      role="status"
    >
      <p>Parabéns! Você concluiu o curso {curso} com sucesso.</p>

      {certificadoDisponivel ? (
        certificadoUrl ? (
          <a
            href={certificadoUrl}
            className="mt-3 inline-block font-semibold text-brand-dark underline"
          >
            Acessar certificado
          </a>
        ) : (
          <p className="mt-3">Seu certificado está disponível.</p>
        )
      ) : (
        <p className="mt-3">Seu certificado ainda não está disponível.</p>
      )}
    </section>
  );
};
