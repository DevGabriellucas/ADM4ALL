"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/Input";
import { BotaoVerSenha } from "@/components/shared/BotaoVerSenha";
import { Notificacao } from "@/components/shared/Notificacao";
import { type LoginFormData, loginFormDataSchema } from "@/schemas/loginSchema";
import { login } from "@/services/authService";
import type { SessionProfile } from "@/services/sessionService";
import {
  formatarCpf,
  pareceCpfEmDigitacao,
  somenteDigitosCpf,
} from "@/utils/cpf";
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

  // Guarda o ultimo valor que ESTE campo mascarou. Sem isso nao da para saber,
  // quando aparece a primeira letra, se os pontos no texto sao mascara nossa
  // ou algo que a pessoa digitou.
  const cpfMascarado = useRef<string | null>(null);

  // Enquanto so ha numero, o campo mostra o CPF formatado e para nos 11
  // digitos. Quando chega letra ou @, ele desfaz a propria mascara e volta a
  // ser um campo de e-mail — e o que salva o e-mail institucional que comeca
  // por matricula (20231234@aluno.unipe.br).
  const aoDigitarIdentificador = (valor: string) => {
    if (pareceCpfEmDigitacao(valor)) {
      const formatado = formatarCpf(valor);
      cpfMascarado.current = formatado;
      return formatado;
    }

    const anterior = cpfMascarado.current;
    cpfMascarado.current = null;

    if (anterior && valor.startsWith(anterior)) {
      return somenteDigitosCpf(anterior) + valor.slice(anterior.length);
    }

    return valor;
  };

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
        placeholder="seu@email.com ou 000.000.000-00"
        type="text"
        autoCapitalize="none"
        autoComplete="username"
        spellCheck={false}
        {...identifierField}
        onChange={(event) => {
          // Minuscula nao e forcada aqui: quem digita o e-mail com maiuscula
          // continua entrando, porque a comparacao no banco ja ignora caixa.
          setValue("identifier", aoDigitarIdentificador(event.target.value), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        error={errors.identifier?.message}
      />

      <div className="relative">
        <Input
          id="password"
          label="Senha"
          className="pr-11"
          placeholder="Sua senha"
          type={isPasswordVisible ? "text" : "password"}
          {...register("password")}
          error={errors.password?.message}
        />
        <BotaoVerSenha
          visivel={isPasswordVisible}
          controla="password"
          onClick={() => setIsPasswordVisible((visible) => !visible)}
        />
      </div>

      <Link
        href="/recuperar-senha"
        className="-mt-1 block w-fit self-end rounded font-medium text-[0.8125rem] text-slate-600 transition-colors hover:text-azure-700 focus-visible:outline-2 focus-visible:outline-azure-600 focus-visible:outline-offset-2"
      >
        Esqueci minha senha
      </Link>

      {/* Erro e sucesso saem no mesmo lugar e com o mesmo cartao: antes o
          "bem-vindo" aparecia embaixo do botao, fora do padrao do sistema. */}
      {message && (
        <Notificacao
          posicao="inline"
          tipo={message.type === "error" ? "erro" : "sucesso"}
        >
          {message.text}
        </Notificacao>
      )}

      <Button className="mt-2" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
