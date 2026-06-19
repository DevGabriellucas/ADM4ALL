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
  onSuccess: () => void;
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
      await forgotPassword(data);
      onSuccess();
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
        className="mt-4 w-full bg-[#B6AEAE] px-6 py-3 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-[#454040] placeholder:text-xl autofill:shadow-[inset_0_0_0_1000px_#B6AEAE] md:w-[75%] xl:w-220"
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
          className="w-full cursor-pointer rounded-[5rem] bg-[#456CA9E5] py-3 font-medium text-xl hover:brightness-110 disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50 md:max-w-[35%] xl:w-[20rem]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Enviando" : "Enviar"}
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
  );
};
