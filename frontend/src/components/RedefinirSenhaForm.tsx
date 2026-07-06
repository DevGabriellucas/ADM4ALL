"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const PasswordToggle = ({
  ativo,
  onClick,
  label,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="-translate-y-1/2 absolute top-1/2 right-4 flex size-10 items-center justify-center rounded text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-brand-medium"
  >
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      {ativo ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 5a16.8 16.8 0 0 1-3.1 3.6M6.6 6.6A17.3 17.3 0 0 0 3 9s3.5 5 9 5c.8 0 1.6-.1 2.3-.3"
        />
      ) : (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z"
          />
          <circle cx="12" cy="12" r="2.5" />
        </>
      )}
    </svg>
  </button>
);

export const RedefinirSenhaForm = ({ token }: RedefinirSenhaFormProps) => {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordDataSchema),
  });

  useEffect(() => {
    if (!isSuccess) return;

    const timeoutId = window.setTimeout(() => {
      router.replace("/");
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [isSuccess, router]);

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
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-16 bg-[#E0F0FF] bg-[url(/adm-para-todos-logo.png)] bg-center bg-no-repeat px-4 py-8 font-poppins">
      <div className="flex flex-col items-center justify-center gap-y-7">
        <h2 className="text-center text-4xl xl:w-245">Redefinir senha</h2>

        {isSuccess && (
          <p className="w-full max-w-[95%] animate-fade-in rounded-md bg-[#76C043] px-6 py-4 text-center font-normal text-xl text-[#454040] shadow-sm xl:w-220 xl:px-0">
            Senha redefinida com sucesso. Redirecionando para o login...
          </p>
        )}

        {!isSuccess && (
          <p className="w-full px-6 text-center font-normal text-xl xl:w-245 xl:px-0">
            {token
              ? "Informe sua nova senha para acessar a plataforma."
              : "Link inválido ou expirado. Solicite uma nova recuperação de senha."}
          </p>
        )}
      </div>

      {token ? (
        <form
          className="flex w-full flex-col items-center gap-y-6 px-2 xl:px-0"
          onSubmit={handleSubmit(redefinirSenhaSubmit)}
        >
          <div className="relative w-full md:w-[75%] xl:w-220">
            <Input
              id="novaSenha"
              label="Nova senha"
              className="mt-4 w-full bg-[#B6AEAE] px-6 py-3 pr-14 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-[#454040] placeholder:text-xl autofill:shadow-[inset_0_0_0_1000px_#B6AEAE]"
              placeholder="Nova senha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
              {...register("novaSenha")}
              error={errors.novaSenha?.message}
            />
            <PasswordToggle
              ativo={mostrarSenha}
              onClick={() => setMostrarSenha((atual) => !atual)}
              label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            />
          </div>

          <div className="relative w-full md:w-[75%] xl:w-220">
            <Input
              id="confirmarSenha"
              label="Confirmar nova senha"
              className="mt-4 w-full bg-[#B6AEAE] px-6 py-3 pr-14 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-[#454040] placeholder:text-xl autofill:shadow-[inset_0_0_0_1000px_#B6AEAE]"
              placeholder="Confirmar nova senha"
              type={mostrarConfirmarSenha ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmarSenha")}
              error={errors.confirmarSenha?.message}
            />
            <PasswordToggle
              ativo={mostrarConfirmarSenha}
              onClick={() => setMostrarConfirmarSenha((atual) => !atual)}
              label={
                mostrarConfirmarSenha
                  ? "Ocultar confirmação de senha"
                  : "Mostrar confirmação de senha"
              }
            />
          </div>

          {errorMessage && (
            <p
              className="text-center font-medium text-red-700 text-sm"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {!isSuccess && (
            <Button
              className="w-full cursor-pointer rounded-[5rem] bg-[#456CA9E5] py-3 font-medium text-xl hover:brightness-110 disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50 md:max-w-[35%] xl:w-[20rem]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Salvando..." : "Salvar nova senha"}
            </Button>
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
