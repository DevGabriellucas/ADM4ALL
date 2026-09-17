"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { MedidorForcaSenha } from "@/components/shared/MedidorForcaSenha";
import { Notificacao } from "@/components/shared/Notificacao";
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
  disabled = false,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    onMouseDown={(event) => event.preventDefault()}
    aria-label={label}
    aria-pressed={ativo}
    title={label}
    disabled={disabled}
    className="-translate-y-1/2 absolute top-6 right-3 flex size-10 items-center justify-center rounded text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-brand-medium disabled:pointer-events-none disabled:opacity-50 sm:top-7 sm:right-4"
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
  const [senhaFocada, setSenhaFocada] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordDataSchema),
  });
  const novaSenhaField = register("novaSenha");

  useEffect(() => {
    if (!isSuccess) return;

    // 1,2s não dava tempo de ler a confirmação antes do redirecionamento.
    const timeoutId = window.setTimeout(() => {
      router.replace("/");
    }, 2800);

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
    <main className="flex min-h-dvh w-full items-center justify-center overflow-y-auto bg-[#E0F0FF] bg-[length:520px_auto] bg-[url(/adm-para-todos-logo.png)] bg-center bg-no-repeat px-4 py-8 font-poppins text-slate-950 sm:bg-[length:720px_auto] lg:bg-[length:960px_auto]">
      <section className="flex w-full max-w-4xl flex-col items-center gap-y-8 sm:gap-y-10 lg:gap-y-14">
        <Link
          href="/recuperar-senha"
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
            Redefinir senha
          </h2>

          {isSuccess ? (
            <Notificacao tipo="sucesso" className="w-full max-w-3xl">
              Senha redefinida com sucesso. Redirecionando para o login...
            </Notificacao>
          ) : (
            <p className="w-full max-w-3xl text-center text-base leading-7 sm:text-xl lg:text-2xl">
              {token
                ? "Informe sua nova senha para acessar a plataforma."
                : "Link inválido ou expirado. Solicite uma nova recuperação de senha."}
            </p>
          )}
        </div>

        {token ? (
          <form
            className="flex w-full max-w-3xl flex-col items-center gap-y-6 sm:gap-y-8"
            onSubmit={handleSubmit(redefinirSenhaSubmit)}
          >
            <div className="relative w-full">
              <Input
                id="novaSenha"
                label="Nova senha"
                className="h-12 w-full rounded-lg bg-[#B6AEAE] px-4 py-3 pr-14 text-base opacity-60 outline-none placeholder:font-normal placeholder:text-[#454040] placeholder:text-base autofill:shadow-[inset_0_0_0_1000px_#B6AEAE] sm:h-14 sm:px-6 sm:text-lg sm:placeholder:text-lg lg:text-xl lg:placeholder:text-xl"
                placeholder="Nova senha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="new-password"
                disabled={isSuccess || isSubmitting}
                {...novaSenhaField}
                onFocus={() => setSenhaFocada(true)}
                onBlur={(evento) => {
                  setSenhaFocada(false);
                  return novaSenhaField.onBlur(evento);
                }}
                error={errors.novaSenha?.message}
              />
              <PasswordToggle
                ativo={mostrarSenha}
                disabled={isSuccess || isSubmitting}
                onClick={() => setMostrarSenha((atual) => !atual)}
                label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              />
              <MedidorForcaSenha
                senha={watch("novaSenha") ?? ""}
                mostrarRequisitos={senhaFocada}
                className="mt-2"
              />
            </div>

            <div className="relative w-full">
              <Input
                id="confirmarSenha"
                label="Confirmar nova senha"
                className="h-12 w-full rounded-lg bg-[#B6AEAE] px-4 py-3 pr-14 text-base opacity-60 outline-none placeholder:font-normal placeholder:text-[#454040] placeholder:text-base autofill:shadow-[inset_0_0_0_1000px_#B6AEAE] sm:h-14 sm:px-6 sm:text-lg sm:placeholder:text-lg lg:text-xl lg:placeholder:text-xl"
                placeholder="Confirmar nova senha"
                type={mostrarConfirmarSenha ? "text" : "password"}
                autoComplete="new-password"
                disabled={isSuccess || isSubmitting}
                {...register("confirmarSenha")}
                error={errors.confirmarSenha?.message}
              />
              <PasswordToggle
                ativo={mostrarConfirmarSenha}
                disabled={isSuccess || isSubmitting}
                onClick={() => setMostrarConfirmarSenha((atual) => !atual)}
                label={
                  mostrarConfirmarSenha
                    ? "Ocultar confirmação de senha"
                    : "Mostrar confirmação de senha"
                }
              />
            </div>

            {errorMessage && (
              <Notificacao tipo="erro" className="w-full">
                {errorMessage}
              </Notificacao>
            )}

            {!isSuccess && (
              <Button
                className="h-12 w-full max-w-xs cursor-pointer rounded-[5rem] bg-[#456CA9E5] px-4 py-3 font-medium text-base hover:brightness-110 disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50 sm:h-14 sm:text-lg lg:max-w-80 lg:text-xl"
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
            className="h-12 w-full max-w-xs cursor-pointer rounded-[5rem] bg-[#456CA9E5] px-4 py-3 text-center font-medium text-base hover:brightness-110 sm:h-14 sm:text-lg lg:max-w-80 lg:text-xl"
          >
            Solicitar novo link
          </Link>
        )}
      </section>
    </main>
  );
};
