import { z } from "zod/v4";

export const loginFormDataSchema = z.object({
  identifier: z.union([
    z.email({ error: "E-mail ou CPF inválido!" }),
    z
      .string()
      .trim()
      .transform( cpf => cpf.replace(/\D/g, ""))
      .refine( cpf => cpf.length === 11, { error: "E-mail ou CPF inválido!" })
  ], { error: "E-mail ou CPF inválido!" }),
  password: z.string().min(8, { error: "Senha inválida!"}).max(12, { error: "Senha inválida!" })
})

export type LoginFormData = z.infer<typeof loginFormDataSchema>

