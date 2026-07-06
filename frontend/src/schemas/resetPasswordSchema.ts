import { z } from "zod/v4";

export const resetPasswordDataSchema = z
  .object({
    novaSenha: z
      .string("A senha e obrigatoria.")
      .min(8, { error: "A senha deve ter no minimo 8 caracteres." }),
    confirmarSenha: z.string("Confirme a nova senha."),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    error: "As senhas nao coincidem.",
    path: ["confirmarSenha"],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordDataSchema>;
