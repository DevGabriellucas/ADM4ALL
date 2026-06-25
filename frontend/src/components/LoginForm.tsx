"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/Input";
import { type LoginFormData, loginFormDataSchema } from "@/schemas/loginSchema";
import { login } from "@/services/authService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Button } from "./Button";

interface LoginFormProps extends ComponentProps<"form"> {}

export const LoginForm = ({ className, ...props }: LoginFormProps) => {
  const router = useRouter();
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormDataSchema),
  });

  const loginSubmit = async (data: LoginFormData) => {
    setMessage(null);

    try {
      const result = await login(data);
      const nomeUsuario = result.usuario?.nome;
      const saudacao = nomeUsuario
        ? ` Bem-vindo(a), ${nomeUsuario}!`
        : "";

      setMessage({
        type: "success",
        text: `${result.mensagem}${saudacao}`,
      });

      if (result.token && result.usuario) {
        document.cookie = `adm4all_token=${result.token}; path=/; max-age=28800; SameSite=Lax`;
        document.cookie = `adm4all_perfil=${result.usuario.perfil}; path=/; max-age=28800; SameSite=Lax`;

        if (result.usuario.instrutorId) {
          document.cookie = `adm4all_instrutor_id=${result.usuario.instrutorId}; path=/; max-age=28800; SameSite=Lax`;
        }

        const destinoPorPerfil = {
          aluno: "/aluno",
          instrutor: "/instrutor",
          coordenador: "/coordenador",
          admin: "/dashboard",
        } as const;

        router.push(destinoPorPerfil[result.usuario.perfil] ?? "/");
      }
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit(loginSubmit)} {...props}>
      <Input
        id="identifier"
        label="E-mail ou CPF"
        className="h-[5.22rem] w-full rounded-lg bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] px-10 py-4 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-xl"
        placeholder="E-mail ou CPF"
        type="text"
        autoCapitalize="none"
        autoComplete="username"
        spellCheck={false}
        {...register("identifier")}
        error={errors.identifier?.message}
      />

      <Input
        id="password"
        label="Senha"
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

      {message?.type === "error" && (
        <output
          className="text-center font-medium text-red-700 text-sm"
          role="alert"
        >
          {message.text}
        </output>
      )}

      <Button
        className="h-[5.22rem] w-full cursor-pointer rounded-lg bg-radial-[at_0%_48.97%] from-[#78A4EA] to-[#445D84] px-10 py-4 font-semibold text-2xl hover:brightness-110 disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      {message?.type === "success" && (
        <output className="text-center font-medium text-green-800 text-sm">
          {message.text}
        </output>
      )}
    </form>
  );
};
