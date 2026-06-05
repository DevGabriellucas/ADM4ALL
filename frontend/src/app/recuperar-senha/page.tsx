"use client";
import { useState } from "react";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function RecuperarSenhar() {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-24 bg-[#E0F0FF] bg-[url(/adm-para-todos-logo.png)] bg-center bg-no-repeat">
      <div className="flex flex-col items-center justify-center gap-y-7">
        <h2 className="text-center text-4xl xl:w-245">Esqueci minha Senha</h2>

        {isSuccess && (
          <p className="w-full max-w-[95%] animate-fade-in rounded-md bg-[#76C043] px-6 py-4 text-center font-normal text-2xl text-[#454040] shadow-sm xl:w-220 xl:px-0">
            Email de recuperação enviado com sucesso.
          </p>
        )}

        <p className="w-full px-6 text-center font-normal text-2xl xl:w-245 xl:px-0">
          Informe seu endereço de email que nós enviaremos um link para
          alteração da senha
        </p>
      </div>
      <ForgotPasswordForm
        className="flex w-full flex-col items-center gap-y-24 px-6 xl:px-0"
        onSuccess={() => setIsSuccess(!false)}
        isSuccess={isSuccess}
      />
    </main>
  );
}
