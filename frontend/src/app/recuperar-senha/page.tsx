"use client";

import Link from "next/link";
import { useState } from "react";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function RecuperarSenha() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <main className="flex min-h-dvh w-full items-center justify-center overflow-y-auto bg-[#E0F0FF] bg-[length:520px_auto] bg-[url(/adm-para-todos-logo.png)] bg-center bg-no-repeat px-4 py-8 font-poppins text-slate-950 sm:bg-[length:720px_auto] lg:bg-[length:960px_auto]">
      <section className="flex w-full max-w-4xl flex-col items-center gap-y-8 sm:gap-y-10 lg:gap-y-14">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-x-2 self-start rounded-md bg-white/45 px-3 py-2 font-medium text-brand-dark text-sm transition-colors hover:bg-white/70"
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

        <div className="flex w-full flex-col items-center justify-center gap-y-5 text-center sm:gap-y-7">
          <h2 className="text-center font-medium text-2xl sm:text-3xl lg:text-4xl">
            Esqueci minha Senha
          </h2>

          {isSuccess && (
            <p className="w-full max-w-3xl animate-fade-in rounded-md bg-[#76C043] px-4 py-3 text-center font-medium text-[#454040] text-sm shadow-sm sm:px-6 sm:py-4 sm:text-lg">
              {successMessage}
            </p>
          )}

          <p className="w-full max-w-3xl text-center text-base leading-7 sm:text-xl lg:text-2xl">
            Informe seu endereco de email que nos enviaremos um link para
            alteracao da senha
          </p>
        </div>

        <ForgotPasswordForm
          className="flex w-full max-w-3xl flex-col items-center gap-y-7 sm:gap-y-10 lg:gap-y-14"
          onSuccess={(message) => {
            setSuccessMessage(message);
            setIsSuccess(true);
          }}
          isSuccess={isSuccess}
        />
      </section>
    </main>
  );
}
