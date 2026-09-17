"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { Notificacao } from "@/components/shared/Notificacao";

export default function RecuperarSenha() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <main className="min-h-dvh w-full bg-[#f5f7fb] font-poppins text-slate-950 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
      <div className="flex min-h-[25rem] items-center justify-center bg-linear-to-br from-[#252c65] via-brand-dark to-[#59639c] px-6 py-12 sm:px-12 lg:min-h-dvh">
        <AuthBrandPanel
          compact
          eyebrow="Acesso seguro"
          title="Retome seu caminho de aprendizagem."
          description="Enviaremos um link seguro para o e-mail cadastrado. O projeto nunca solicita sua senha por e-mail."
        />
      </div>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-slate-200/60 shadow-xl sm:p-9">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-x-2 rounded-md font-medium text-brand-dark text-sm transition-colors hover:text-brand-medium"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <title>Voltar</title>
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>

          <div className="mt-8 flex w-full flex-col justify-center text-left">
            <p className="font-semibold text-brand-dark text-xs uppercase tracking-[0.2em]">
              Recuperação de acesso
            </p>
            <h2 className="mt-2 font-semibold text-2xl tracking-tight">
              Esqueceu sua senha?
            </h2>

            {isSuccess && (
              <Notificacao tipo="sucesso" className="w-full max-w-3xl">
                {successMessage}
              </Notificacao>
            )}

            <p className="mt-3 w-full text-slate-500 text-sm leading-6">
              Informe o e-mail cadastrado e enviaremos um link para criar uma
              nova senha.
            </p>
          </div>

          <ForgotPasswordForm
            className="mt-7 flex w-full flex-col items-stretch gap-y-5"
            onSuccess={(message) => {
              setSuccessMessage(message);
              setIsSuccess(true);
            }}
            isSuccess={isSuccess}
          />
        </div>
      </section>
    </main>
  );
}
