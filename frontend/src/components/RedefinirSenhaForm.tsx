"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  type ResetPasswordData,
  resetPasswordDataSchema,
} from "@/schemas/resetPasswordSchema";
import { resetPassword } from "@/services/authService";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface RedefinirSenhaFormProps {
  token: string | null;
}

export const RedefinirSenhaForm = ({ token }: RedefinirSenhaFormProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordDataSchema),
  });

  const redefinirSenhaSubmit = async (data: ResetPasswordData) => {
    if (!token) return;

    setErrorMessage(null);

    try {
      await resetPassword({ token, novaSenha: data.novaSenha });
      setIsSuccess(true);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-24 bg-[#E0F0FF] bg-[url(/adm-para-todos-logo.png)] bg-center bg-no-repeat">
      <div className="flex flex-col items-center justify-center gap-y-7">
        <h2 className="text-center text-4xl xl:w-245">Redefinir Senha</h2>

        {isSuccess && (
          <p className="w-full max-w-[95%] animate-fade-in rounded-md bg-[#76C043] px-6 py-4 text-center font-normal text-2xl text-[#454040] shadow-sm xl:w-220 xl:px-0">
            Senha redefinida com sucesso.
          </p>
        )}

        {!isSuccess && (
          <p className="w-full px-6 text-center font-normal text-2xl xl:w-245 xl:px-0">
            {token
              ? "Informe sua nova senha para acessar a plataforma."
              : "Link inválido ou expirado. Solicite uma nova recuperação de senha."}
          </p>
        )}
      </div>

      {token ? (
        <form
          className="flex w-full flex-col items-center gap-y-6 px-6 xl:px-0"
          onSubmit={handleSubmit(redefinirSenhaSubmit)}
        >
          <Input
            id="novaSenha"
            label="Nova senha"
            className="mt-4 w-full bg-[#B6AEAE] px-6 py-3 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-[#454040] placeholder:text-xl autofill:shadow-[inset_0_0_0_1000px_#B6AEAE] md:w-[75%] xl:w-220"
            placeholder="Nova senha"
            type="password"
            autoComplete="new-password"
            {...register("novaSenha")}
            error={errors.novaSenha?.message}
          />

          <Input
            id="confirmarSenha"
            label="Confirmar nova senha"
            className="mt-4 w-full bg-[#B6AEAE] px-6 py-3 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-[#454040] placeholder:text-xl autofill:shadow-[inset_0_0_0_1000px_#B6AEAE] md:w-[75%] xl:w-220"
            placeholder="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            {...register("confirmarSenha")}
            error={errors.confirmarSenha?.message}
          />

          {errorMessage && (
            <p
              className="text-center font-medium text-red-700 text-sm"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {!isSuccess ? (
            <Button
              className="w-full cursor-pointer rounded-[5rem] bg-[#456CA9E5] py-3 font-medium text-xl hover:brightness-110 disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50 md:max-w-[35%] xl:w-[20rem]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Salvando..." : "Salvar nova senha"}
            </Button>
          ) : (
            <Link
              href="/"
              className="w-full cursor-pointer rounded-[5rem] bg-[#456CA9E5] py-3 text-center font-medium text-xl hover:brightness-110 md:max-w-[35%] xl:w-[20rem]"
            >
              Voltar ao login
            </Link>
          )}
        </form>
      ) : (
        <Link
          href="/recuperar-senha"
          className="w-full cursor-pointer rounded-[5rem] bg-[#456CA9E5] py-3 text-center font-medium text-xl hover:brightness-110 md:max-w-[35%] xl:w-[20rem]"
        >
          Solicitar novo link
        </Link>
      )}
    </main>
  );
};
