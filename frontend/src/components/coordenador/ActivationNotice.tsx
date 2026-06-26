interface ActivationNoticeProps {
  userLabel: string;
}

export const ActivationNotice = ({ userLabel }: ActivationNoticeProps) => {
  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="font-semibold text-amber-900 text-sm">
        Acesso pendente de ativação
      </p>
      <p className="mt-1 text-amber-800 text-xs leading-5">
        O {userLabel} será criado sem acesso ativo. Ele precisará usar o link
        enviado por e-mail para confirmar os dados e criar sua senha.
      </p>
    </div>
  );
};
