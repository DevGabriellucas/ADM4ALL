"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { MedidorForcaSenha } from "@/components/shared/MedidorForcaSenha";
import { Notificacao } from "@/components/shared/Notificacao";
import {
  type ActivateAccountFormData,
  createActivateAccountSchema,
} from "@/schemas/activateAccountSchema";
import {
  activateAccount,
  validateActivationToken,
} from "@/services/authService";
import type {
  ActivateAccountPayload,
  ActivationPendingField,
  ActivationTokenResponse,
} from "@/types/auth";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatarTelefone } from "@/utils/telefone";

interface ActivateAccountFormProps {
  token: string | null;
}

interface PendingFieldsFormProps {
  token: string;
  activation: ActivationTokenResponse;
  onSuccess: () => void;
}

const FIELD_LABELS: Record<Exclude<ActivationPendingField, "senha">, string> = {
  whatsapp: "WhatsApp",
  rgm: "RGM",
  cursoUnipe: "Curso Unipê",
  areaAtuacao: "Área de atuação",
  formacao: "Formação",
};

const getValidationErrorMessage = (error: unknown) => {
  const message = getErrorMessage(error);

  if (/ja utilizado/i.test(message)) {
    return "Este link de ativação já foi utilizado.";
  }
  if (/token|invalido|expirado/i.test(message)) {
    return "Link inválido ou expirado.";
  }

  return message;
};

const PendingFieldsForm = ({
  token,
  activation,
  onSuccess,
}: PendingFieldsFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [senhaFocada, setSenhaFocada] = useState(false);
  const fields = new Set(activation.camposPendentes);
  const schema = createActivateAccountSchema(activation.camposPendentes);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivateAccountFormData>({
    resolver: zodResolver(schema),
  });
  const senhaField = register("senha");

  const onSubmit = async (data: ActivateAccountFormData) => {
    setSubmitError(null);
    const payload: ActivateAccountPayload = {};

    for (const field of activation.camposPendentes) {
      if (field === "senha") {
        payload.senha = data.senha;
        payload.confirmarSenha = data.confirmarSenha;
      } else if (data[field]) {
        payload[field] = data[field];
      }
    }

    try {
      await activateAccount(token, payload);
      onSuccess();
    } catch (error) {
      setSubmitError(getValidationErrorMessage(error));
    }
  };

  const renderTextField = (field: Exclude<ActivationPendingField, "senha">) => (
    <label
      key={field}
      htmlFor={field}
      className="flex flex-col gap-2 text-slate-800 text-sm"
    >
      <span className="font-semibold">
        {FIELD_LABELS[field]}
        {(field === "rgm" || field === "cursoUnipe") && " (opcional)"}
      </span>
      <Input
        id={field}
        type={field === "whatsapp" ? "tel" : "text"}
        inputMode={field === "whatsapp" ? "tel" : undefined}
        maxLength={field === "whatsapp" ? 15 : undefined}
        placeholder={FIELD_LABELS[field]}
        className="h-14 px-5 text-base"
        autoComplete={field === "whatsapp" ? "tel" : "off"}
        {...register(field)}
        onChange={(event) => {
          if (field === "whatsapp") {
            event.target.value = formatarTelefone(event.target.value);
          }
          register(field).onChange(event);
        }}
        error={errors[field]?.message}
      />
    </label>
  );

  return (
    <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {fields.has("senha") && (
        <>
          <label
            htmlFor="senha"
            className="flex flex-col gap-2 text-slate-800 text-sm"
          >
            <span className="font-semibold">Nova senha</span>
            <Input
              id="senha"
              type="password"
              placeholder="Nova senha"
              autoComplete="new-password"
              className="h-14 px-5 text-base"
              {...senhaField}
              onFocus={() => setSenhaFocada(true)}
              onBlur={(evento) => {
                setSenhaFocada(false);
                return senhaField.onBlur(evento);
              }}
              error={errors.senha?.message}
            />
            <MedidorForcaSenha
              senha={watch("senha") ?? ""}
              mostrarRequisitos={senhaFocada}
            />
          </label>
          <label
            htmlFor="confirmarSenha"
            className="flex flex-col gap-2 text-slate-800 text-sm"
          >
            <span className="font-semibold">Confirmar nova senha</span>
            <Input
              id="confirmarSenha"
              type="password"
              placeholder="Confirmar nova senha"
              autoComplete="new-password"
              className="h-14 px-5 text-base"
              {...register("confirmarSenha")}
              error={errors.confirmarSenha?.message}
            />
          </label>
        </>
      )}

      {activation.camposPendentes
        .filter((field) => field !== "senha")
        .map((field) => renderTextField(field))}

      {submitError && <Notificacao tipo="erro">{submitError}</Notificacao>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full rounded-lg bg-brand-dark font-semibold text-white hover:brightness-110 disabled:opacity-60"
      >
        {isSubmitting ? "Ativando..." : "Ativar conta"}
      </Button>
    </form>
  );
};

export const ActivateAccountForm = ({ token }: ActivateAccountFormProps) => {
  const [activation, setActivation] = useState<ActivationTokenResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    validateActivationToken(token)
      .then((result) => {
        if (active) {
          setActivation(result);
          setValidationError(null);
        }
      })
      .catch((error) => {
        if (active) {
          setValidationError(getValidationErrorMessage(error));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const renderContent = () => {
    if (!token) {
      return (
        <MessageState title="Link de ativação inválido.">
          Solicite um novo convite ou entre em contato com a coordenação.
        </MessageState>
      );
    }

    if (isLoading) {
      return (
        <output className="block py-12 text-center text-slate-700">
          Validando seu link de ativação...
        </output>
      );
    }

    if (validationError || !activation) {
      return (
        <MessageState title={validationError ?? "Link inválido ou expirado."}>
          Solicite um novo convite ou entre em contato com a coordenação.
        </MessageState>
      );
    }

    if (isSuccess) {
      return (
        <output className="block text-center">
          <h1 className="font-semibold text-2xl text-slate-950">
            Conta ativada com sucesso
          </h1>
          <p className="mt-3 text-slate-700">
            Você já pode entrar no ADM Para Todos.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-brand-dark px-7 font-semibold text-white hover:brightness-110"
          >
            Ir para login
          </Link>
        </output>
      );
    }

    return (
      <>
        <h1 className="font-semibold text-2xl text-slate-950">
          Olá, {activation.nome}.
        </h1>
        <p className="mt-2 text-slate-600">{activation.email}</p>
        <p className="mt-4 text-slate-700">
          {activation.camposPendentes.length === 0
            ? "Clique abaixo para confirmar seu e-mail e ativar sua conta."
            : "Complete os dados abaixo para ativar sua conta."}
        </p>
        <PendingFieldsForm
          token={token}
          activation={activation}
          onSuccess={() => setIsSuccess(true)}
        />
      </>
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-bl from-brand-dark/90 via-brand-medium/90 to-brand-light/90 px-4 py-10 font-poppins">
      <section className="w-full max-w-lg rounded-xl bg-white p-7 shadow-xl sm:p-10">
        {renderContent()}
      </section>
    </main>
  );
};

const MessageState = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="text-center" role="alert">
    <h1 className="font-semibold text-2xl text-slate-950">{title}</h1>
    <p className="mt-3 text-slate-700">{children}</p>
    <Link
      href="/"
      className="mt-7 inline-flex h-12 items-center justify-center rounded-lg border border-brand-dark px-7 font-semibold text-brand-dark hover:bg-brand-light/20"
    >
      Voltar ao login
    </Link>
  </div>
);
