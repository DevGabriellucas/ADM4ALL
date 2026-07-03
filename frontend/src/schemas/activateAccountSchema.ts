import { z } from "zod/v4";
import type { ActivationPendingField } from "@/types/auth";

const optionalText = z.string().trim().optional();

export const createActivateAccountSchema = (
  camposPendentes: ActivationPendingField[],
) => {
  const campos = new Set(camposPendentes);

  return z
    .object({
      senha: optionalText,
      confirmarSenha: optionalText,
      whatsapp: optionalText,
      rgm: optionalText,
      cursoUnipe: optionalText,
      areaAtuacao: optionalText,
      formacao: optionalText,
    })
    .superRefine((data, context) => {
      if (campos.has("senha")) {
        if (!data.senha || data.senha.length < 8) {
          context.addIssue({
            code: "custom",
            path: ["senha"],
            message: "A senha deve ter no mínimo 8 caracteres.",
          });
        }
        if (!data.confirmarSenha) {
          context.addIssue({
            code: "custom",
            path: ["confirmarSenha"],
            message: "Confirme a nova senha.",
          });
        } else if (data.senha !== data.confirmarSenha) {
          context.addIssue({
            code: "custom",
            path: ["confirmarSenha"],
            message: "As senhas não coincidem.",
          });
        }
      }

      if (campos.has("whatsapp")) {
        const telefone = data.whatsapp?.replace(/\D/g, "") ?? "";
        if (telefone.length < 10 || telefone.length > 11) {
          context.addIssue({
            code: "custom",
            path: ["whatsapp"],
            message: "Informe um WhatsApp válido.",
          });
        }
      }

      for (const campo of ["areaAtuacao", "formacao"] as const) {
        if (campos.has(campo) && !data[campo]) {
          context.addIssue({
            code: "custom",
            path: [campo],
            message:
              campo === "areaAtuacao"
                ? "Informe sua área de atuação."
                : "Informe sua formação.",
          });
        }
      }

      if (data.rgm && !/^\d{8}$/.test(data.rgm)) {
        context.addIssue({
          code: "custom",
          path: ["rgm"],
          message: "O RGM deve conter exatamente 8 dígitos.",
        });
      }

      if (
        campos.has("rgm") &&
        campos.has("cursoUnipe") &&
        ((data.rgm && !data.cursoUnipe) || (!data.rgm && data.cursoUnipe))
      ) {
        context.addIssue({
          code: "custom",
          path: [data.rgm ? "cursoUnipe" : "rgm"],
          message: "Informe o RGM e o curso Unipê em conjunto.",
        });
      }
    });
};

export type ActivateAccountFormData = z.input<
  ReturnType<typeof createActivateAccountSchema>
>;
