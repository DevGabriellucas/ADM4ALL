"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/Input";
import { Notificacao } from "@/components/shared/Notificacao";
import { type LoginFormData, loginFormDataSchema } from "@/schemas/loginSchema";
import { login } from "@/services/authService";
import type { SessionProfile } from "@/services/sessionService";
import { formatarCpf, pareceCpf } from "@/utils/cpf";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Button } from "./Button";

interface LoginFormProps extends ComponentProps<"form"> {
  redirectTo?: string;
}

const DASHBOARD_POR_PERFIL: Record<SessionProfile, string> = {
  aluno: "/aluno/dashboard",
  instrutor: "/instrutor/dashboard",
  coordenador: "/coordenador/dashboard",
  admin: "/coordenador/dashboard",
};

const PREFIXO_POR_PERFIL: Record<SessionProfile, string> = {
  aluno: "/aluno",
  instrutor: "/instrutor",
  coordenador: "/coordenador",
  admin: "/coordenador",
};

const isRedirectToSeguro = (
  redirectTo: string,
  perfil: SessionProfile,
): boolean => {
  if (!redirectTo.startsWith("/")) {
    return false;
  }

  if (redirectTo.startsWith("//")) {
    return false;
  }

  const lower = redirectTo.toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    return false;
  }

  const prefixo = PREFIXO_POR_PERFIL[perfil];
  return redirectTo === prefixo || redirectTo.startsWith(`${prefixo}/`);
};

const resolverRedirectTo = (
  redirectTo: string | undefined,
  perfil: SessionProfile,
): string => {
  if (redirectTo && isRedirectToSeguro(redirectTo, perfil)) {
    return redirectTo;
  }

  return DASHBOARD_POR_PERFIL[perfil];
};

export const LoginForm = ({
  className,
  redirectTo,
  ...props
}: LoginFormProps) => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormDataSchema),
  });

  const identifierField = register("identifier");

  const loginSubmit = async (data: LoginFormData) => {
    setMessage(null);

    try {
      const result = await login(data);

      setMessage({
        type: "success",
        text: `${result.mensagem} Bem-vindo(a), ${result.usuario.nome}!`,
      });

      await new Promise((resolve) => window.setTimeout(resolve, 900));
      router.replace(resolverRedirectTo(redirectTo, result.usuario.perfil));
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    }
  };

  return (
    <form
      className={`min-w-0 ${className ?? ""}`}
      onSubmit={handleSubmit(loginSubmit)}
      {...props}
    >
      <Input
        id="identifier"
        label="E-mail ou CPF"
        className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition placeholder:font-normal placeholder:text-base focus:border-brand-medium focus:bg-white focus:ring-4 focus:ring-brand-light/30"
        placeholder="E-mail ou CPF"
        type="text"
        autoCapitalize="none"
        autoComplete="username"
        spellCheck={false}
        {...identifierField}
        onChange={(event) => {
          // Nenhuma mascara enquanto digita. A mascara so pode ser decidida
          // com o valor inteiro em maos: aplicada tecla a tecla, ela reescrevia
          // o comeco de um e-mail institucional com matricula numerica e ainda
          // descartava tudo depois do 11o digito, e o aluno so descobria no
          // "Credenciais invalidas", sem nada na tela explicando.
          setValue("identifier", event.target.value.toLowerCase(), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        onBlur={(event) => {
          const valor = event.target.value;

          if (pareceCpf(valor)) {
            setValue("identifier", formatarCpf(valor), {
              shouldDirty: true,
              shouldValidate: true,
            });
          }

          identifierField.onBlur(event);
        }}
        error={errors.identifier?.message}
      />

      <div className="relative">
        <Input
          id="password"
          label="Senha de acesso"
          className="mt-4 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-base outline-none transition placeholder:font-normal placeholder:text-base focus:border-brand-medium focus:bg-white focus:ring-4 focus:ring-brand-light/30"
          placeholder="Senha de acesso"
          type={isPasswordVisible ? "text" : "password"}
          {...register("password")}
          error={errors.password?.message}
        />
        <button
          type="button"
          className="-translate-y-1/2 absolute top-[2.5rem] right-3 flex size-9 cursor-pointer items-center justify-center rounded text-slate-700 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-brand-medium sm:top-[3.61rem] sm:right-6 sm:size-10"
          aria-controls="password"
          aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isPasswordVisible}
          title={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsPasswordVisible((visible) => !visible);
          }}
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
        className="block w-full max-w-full pr-1 text-right font-medium text-brand-dark text-sm underline underline-offset-2 duration-200 hover:text-brand-medium"
      >
        Recuperar Senha
      </Link>

      {/* Erro e sucesso saem no mesmo lugar e com o mesmo cartao: antes o
          "bem-vindo" aparecia embaixo do botao, fora do padrao do sistema. */}
      {message && (
        <Notificacao
          tipo={message.type === "error" ? "erro" : "sucesso"}
          className="-translate-x-1/2 fixed top-4 left-1/2 z-[60] w-[min(92vw,42rem)] shadow-lg"
        >
          {message.text}
        </Notificacao>
      )}

      <Button
        className="h-12 w-full cursor-pointer rounded-lg bg-brand-dark px-4 py-3 font-semibold text-base text-white transition hover:bg-[#252c65] disabled:pointer-events-none disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
