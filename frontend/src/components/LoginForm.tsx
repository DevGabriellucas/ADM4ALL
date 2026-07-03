"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/Input";
import { type LoginFormData, loginFormDataSchema } from "@/schemas/loginSchema";
import { login } from "@/services/authService";
import { saveSession } from "@/services/sessionService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Button } from "./Button";

interface LoginFormProps extends ComponentProps<"form"> {}

export const LoginForm = ({ className, ...props }: LoginFormProps) => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
      const nomeUsuario = result.usuario.nome;
      const saudacao = ` Bem-vindo(a), ${nomeUsuario}!`;

      setMessage({
        type: "success",
        text: `${result.mensagem},${saudacao}`,
      });

      saveSession(result);

      const destinoPorPerfil = {
        aluno: "/aluno/dashboard",
        instrutor: "/instrutor/dashboard",
        coordenador: "/coordenador/dashboard",
        admin: "/coordenador/dashboard",
      } as const;

      router.replace(destinoPorPerfil[result.usuario.perfil]);
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

      <div className="relative">
        <Input
          id="password"
          label="Senha"
          className="mt-4 h-[5.22rem] w-full rounded-lg bg-radial-[at_0%_50.72%] from-[#BFD0EC] to-[#6D7686] px-10 py-4 pr-20 text-xl opacity-60 outline-none placeholder:font-normal placeholder:text-xl"
          placeholder="Senha"
          type={isPasswordVisible ? "text" : "password"}
          {...register("password")}
          error={errors.password?.message}
        />
        <button
          type="button"
          className="-translate-y-1/2 absolute top-[3.61rem] right-6 flex size-10 cursor-pointer items-center justify-center rounded text-slate-700 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-brand-medium"
          aria-controls="password"
          aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isPasswordVisible}
          title={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setIsPasswordVisible((visible) => !visible)}
        >
          {isPasswordVisible ? (
            <svg
              aria-hidden="true"
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 5a16.8 16.8 0 0 1-3.1 3.6M6.6 6.6A17.3 17.3 0 0 0 3 9s3.5 5 9 5c.8 0 1.6-.1 2.3-.3"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z"
              />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </div>

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
