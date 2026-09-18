import { Notificacao } from "@/components/shared/Notificacao";

interface ActivationNoticeProps {
  userLabel: string;
  /**
   * Cadastro de aluno e de instrutor pela coordenacao nao dispara e-mail: sao
   * cadastros em lote, e uma rajada queimaria a cota diaria do provedor. So o
   * convite de coordenador continua enviando o link sozinho.
   */
  enviaEmail?: boolean;
}

export const ActivationNotice = ({
  userLabel,
  enviaEmail = true,
}: ActivationNoticeProps) => {
  return (
    <Notificacao posicao="inline" tipo="aviso" className="mt-4">
      <p className="font-semibold">Acesso pendente de ativação</p>
      <p className="mt-1">
        {enviaEmail ? (
          <>
            O {userLabel} será criado sem acesso ativo. Ele precisará usar o
            link enviado por e-mail para confirmar os dados e criar sua senha.
          </>
        ) : (
          <>
            O {userLabel} será criado com o histórico dele, mas sem acesso ao
            sistema e <strong>sem nenhum e-mail enviado</strong>. Quando
            precisar entrar, use "Reenviar ativação" na listagem para mandar o
            link.
          </>
        )}
      </p>
    </Notificacao>
  );
};
