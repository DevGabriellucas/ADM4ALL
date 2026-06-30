import { z } from "zod/v4";

export const resetPasswordDataSchema = z
  .object({
    novaSenha: z
      .string("A senha é obrigatória.")
      .min(8, { error: "A senha deve ter no mínimo 8 caracteres." }),
    confirmarSenha: z.string("Confirme a nova senha."),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    error: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordDataSchema>;
