"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { Notificacao } from "@/components/shared/Notificacao";

export default function RecuperarSenha() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <AuthShell
      eyebrow="Recuperação de acesso"
      tituloPainel="Perdeu a senha? Dá para recuperar em dois passos."
      descricaoPainel="Você recebe um link por e-mail e cria uma senha nova. O link vale por tempo limitado e só pode ser usado uma vez."
      tituloCartao="Esqueci minha senha"
      descricaoCartao="Informe o e-mail que você usou no cadastro."
      voltarPara={{ href: "/", texto: "Voltar para o acesso" }}
    >
      {isSuccess && (
        <Notificacao posicao="inline" tipo="sucesso" className="mb-5">
          {successMessage}
        </Notificacao>
      )}

      <ForgotPasswordForm
        className="flex w-full flex-col gap-y-4"
        onSuccess={(message) => {
          setSuccessMessage(message);
          setIsSuccess(true);
        }}
        isSuccess={isSuccess}
      />
    </AuthShell>
  );
}
