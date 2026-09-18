"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { type ComponentProps, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/Input";
import { Notificacao } from "@/components/shared/Notificacao";
import {
  type ForgotPasswordData,
  forgotPasswordDataSchema,
} from "@/schemas/forgotPasswordSchema";
import { forgotPassword } from "@/services/authService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Button } from "./Button";

interface ForgotPasswordProps extends ComponentProps<"form"> {
  isSuccess: boolean;
  onSuccess: (message: string) => void;
}

export const ForgotPasswordForm = ({
  className,
  isSuccess,
  onSuccess,
  ...props
}: ForgotPasswordProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordDataSchema),
  });

  const emailField = register("email");

  const forgotPasswordSubmit = async (data: ForgotPasswordData) => {
    setErrorMessage(null);

    try {
      const result = await forgotPassword(data);
      onSuccess(result.mensagem);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <form
      className={className}
      onSubmit={handleSubmit(forgotPasswordSubmit)}
      {...props}
    >
      <Input
        id="email"
        label="E-mail cadastrado"
        placeholder="seu@email.com"
        hint="Enviamos o link de redefinição para este endereço."
        type="email"
        autoComplete="email"
        {...emailField}
        onChange={(event) => {
          setValue("email", event.target.value, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        error={errors.email?.message}
      />

      {errorMessage && (
        <Notificacao posicao="inline" tipo="erro">
          {errorMessage}
        </Notificacao>
      )}

      {!isSuccess ? (
        <Button className="mt-1" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
        </Button>
      ) : (
        <Link
          href="/"
          className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg border border-line bg-white px-5 font-semibold text-[0.9375rem] text-navy-800 transition-colors hover:border-azure-500 hover:text-azure-700 focus-visible:outline-2 focus-visible:outline-azure-600 focus-visible:outline-offset-2"
        >
          Voltar para o acesso
        </Link>
      )}
    </form>
  );
};
