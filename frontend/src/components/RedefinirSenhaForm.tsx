"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { BotaoVerSenha } from "@/components/shared/BotaoVerSenha";
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
    <AuthShell
      eyebrow="Recuperação de acesso"
      tituloPainel="Escolha uma senha que só você saiba."
      descricaoPainel="Use pelo menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo. Evite repetir a senha de outros serviços."
      tituloCartao={token ? "Criar nova senha" : "Link inválido"}
      descricaoCartao={
        token
          ? "Digite a nova senha duas vezes para confirmar."
          : "Este link expirou ou já foi usado. Peça um novo para continuar."
      }
      voltarPara={{ href: "/recuperar-senha", texto: "Voltar" }}
    >
      {isSuccess && (
        <Notificacao posicao="inline" tipo="sucesso" className="mb-5">
          Senha redefinida com sucesso. Levando você para o acesso...
        </Notificacao>
      )}

      {token ? (
        <form
          className="flex w-full flex-col gap-y-4"
          onSubmit={handleSubmit(redefinirSenhaSubmit)}
        >
          <div className="relative w-full">
            <Input
              id="novaSenha"
              label="Nova senha"
              className="pr-11"
              placeholder="Sua nova senha"
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
            <BotaoVerSenha
              visivel={mostrarSenha}
              controla="novaSenha"
              disabled={isSuccess || isSubmitting}
              onClick={() => setMostrarSenha((atual) => !atual)}
              descricao="nova senha"
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
              className="pr-11"
              placeholder="Repita a nova senha"
              type={mostrarConfirmarSenha ? "text" : "password"}
              autoComplete="new-password"
              disabled={isSuccess || isSubmitting}
              {...register("confirmarSenha")}
              error={errors.confirmarSenha?.message}
            />
            <BotaoVerSenha
              visivel={mostrarConfirmarSenha}
              controla="confirmarSenha"
              disabled={isSuccess || isSubmitting}
              onClick={() => setMostrarConfirmarSenha((atual) => !atual)}
              descricao="confirmação de senha"
            />
          </div>

          {errorMessage && (
            <Notificacao posicao="inline" tipo="erro">
              {errorMessage}
            </Notificacao>
          )}

          {!isSuccess && (
            <Button className="mt-1" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Salvando..." : "Salvar nova senha"}
            </Button>
          )}
        </form>
      ) : (
        <Link
          href="/recuperar-senha"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-azure-600 px-5 font-semibold text-[0.9375rem] text-white transition-colors hover:bg-azure-700 focus-visible:outline-2 focus-visible:outline-azure-600 focus-visible:outline-offset-2"
        >
          Solicitar novo link
        </Link>
      )}
    </AuthShell>
  );
};
