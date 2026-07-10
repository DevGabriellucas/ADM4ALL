"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { type ComponentProps, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/Input";
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
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordDataSchema),
  });

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
        label="E-mail"
        className="h-12 w-full rounded-lg bg-[#B6AEAE] px-4 py-3 text-base opacity-60 outline-none placeholder:font-normal placeholder:text-[#454040] placeholder:text-base autofill:shadow-[inset_0_0_0_1000px_#B6AEAE] sm:h-14 sm:px-6 sm:text-lg sm:placeholder:text-lg lg:text-xl lg:placeholder:text-xl"
        placeholder="E-mail"
        type="email"
        {...register("email")}
        error={errors.email?.message}
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
          className="h-12 w-full max-w-xs cursor-pointer rounded-[5rem] bg-[#456CA9E5] px-4 py-3 font-medium text-base hover:brightness-110 disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50 sm:h-14 sm:text-lg lg:max-w-80 lg:text-xl"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Enviando" : "Enviar"}
        </Button>
      ) : (
        <Link
          href="/"
          className="h-12 w-full max-w-xs cursor-pointer rounded-[5rem] bg-[#456CA9E5] px-4 py-3 text-center font-medium text-base hover:brightness-110 sm:h-14 sm:text-lg lg:max-w-80 lg:text-xl"
        >
          Voltar ao login
        </Link>
      )}
    </form>
  );
};
