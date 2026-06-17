"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/Input";
import { type LoginFormData, loginFormDataSchema } from "@/schemas/loginSchema";
import { Button } from "./Button";

interface LoginFormProps extends ComponentProps<"form"> {}

export const LoginForm = ({ className, ...props }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormDataSchema),
  });

  const loginSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: data.identifier,
            password: data.password,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.erro || "Falha ao realizar login.");
      }

      alert(`✅ ${result.mensagem}\nBem-vindo(a), ${result.aluno.nome}!`);

    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit(loginSubmit)} {...props}>
      <Input
        className="h-[5.22rem] w-full rounded-lg bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] px-10 py-4 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-xl"
        placeholder="E-mail ou CPF"
        type="text"
        {...register("identifier")}
        error={errors.identifier?.message}
      />

      <Input
        className="mt-4 h-[5.22rem] w-full rounded-lg bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] px-10 py-4 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-xl"
        placeholder="Senha"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />

      <Link
        href="/recuperar-senha"
        className="pr-1 text-right text-[#524ABF] text-base underline underline-offset-2 duration-200 hover:text-indigo-900"
      >
        Recuperar Senha
      </Link>

      <Button
        className="h-[5.22rem] w-full cursor-pointer rounded-lg bg-radial-[at_0%_48.97%] from-[#78A4EA] to-[#445D84] px-10 py-4 font-semibold text-2xl hover:brightness-110"
        type="submit"
      >
        Entrar
      </Button>
    </form>
  );
};
