import { z } from "zod/v4";

export const loginFormDataSchema = z.object({
  identifier: z.union(
    [
      z.email({ error: "E-mail ou CPF inválido!" }),
      z
        .string()
        .trim()
        .transform((cpf) => cpf.replace(/\D/g, ""))
        .refine((cpf) => cpf.length === 11, {
          error: "E-mail ou CPF inválido!",
        }),
    ],
    { error: "E-mail ou CPF inválido!" },
  ),
  password: z
    .string("A senha é obrigatória.")
    // Campo em branco tem erro próprio: sem o min(1) a mensagem exibida era
    // "A senha deve ter no mínimo 8 caracteres", que não é o problema.
    .min(1, { error: "A senha é obrigatória." })
    .min(8, { error: "A senha deve ter no mínimo 8 caracteres." }),
});

export type LoginFormData = z.infer<typeof loginFormDataSchema>;
