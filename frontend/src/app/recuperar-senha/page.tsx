"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function RecuperarSenha() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#E0F0FF] px-4 py-6 font-poppins text-slate-950">
      <section className="flex w-full max-w-[300px] flex-col gap-y-6 rounded-xl bg-white/75 px-5 py-6 shadow-sm ring-1 ring-white/60 sm:px-8 sm:py-8 lg:max-w-lg">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-x-2 rounded-md px-2 py-1 font-medium text-brand-dark text-sm transition-colors hover:bg-brand-light/40"
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

        <div className="flex w-full flex-col items-center justify-center gap-y-5 text-center">
          <Image
            src="/adm-para-todos-logo.png"
            alt="ADM para Todos"
            width={140}
            height={96}
            priority
            className="!h-20 !w-auto object-contain opacity-80"
          />

          <h2 className="text-center font-medium text-2xl sm:text-3xl">
            Esqueci minha senha
          </h2>

          {isSuccess && (
            <p className="w-full animate-fade-in rounded-md bg-emerald-100 px-4 py-3 text-center font-medium text-emerald-800 text-sm shadow-sm">
              {successMessage}
            </p>
          )}

          <p className="w-full text-center text-slate-700 text-sm leading-6 sm:text-base">
            Informe seu endereco de email que nos enviaremos um link para
            alteracao da senha.
          </p>
        </div>

        <ForgotPasswordForm
          className="flex w-full flex-col items-center gap-y-5"
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
