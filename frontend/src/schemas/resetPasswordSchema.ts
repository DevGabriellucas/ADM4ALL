import { z } from "zod/v4";
import { primeiroErroSenha } from "@/utils/senha";

export const resetPasswordDataSchema = z
  .object({
    novaSenha: z.string("A senha e obrigatoria.").superRefine((valor, ctx) => {
      const erro = primeiroErroSenha(valor);
      if (erro) {
        ctx.addIssue({ code: "custom", message: erro });
      }
    }),
    confirmarSenha: z.string("Confirme a nova senha."),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    error: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordDataSchema>;
