import { z } from "zod/v4";

export const cadastroFormDataSchema = z
  .object({
    nome: z.string().trim().min(3, { error: "Nome inválido!" }),
    cpf: z
      .string()
      .trim()
      .transform((valor) => valor.replace(/\D/g, ""))
      .refine((valor) => valor.length === 11, { error: "CPF inválido!" }),
    telefone: z
      .string()
      .trim()
      .transform((valor) => valor.replace(/\D/g, ""))
      .refine((valor) => valor.length >= 10 && valor.length <= 11, {
        error: "Telefone inválido!",
      }),
    email: z.email({ error: "Email inválido!" }),
    dataNascimento: z
      .string()
      .min(1, { error: "Informe a data de nascimento." })
      .refine(
        (valor) => {
          const data = new Date(valor);
          if (Number.isNaN(data.getTime())) {
            return false;
          }
          const hojeIso = new Date().toISOString().slice(0, 10);
          const dataIso = data.toISOString().slice(0, 10);
          return dataIso < hojeIso;
        },
        { error: "A data de nascimento deve ser anterior a hoje." },
      ),
    isAlunoUnipe: z.boolean(),
    cursoUnipe: z.string().optional(),

    senha: z.string().min(1, { error: "A senha é obrigatória!" }),
    confirmarSenha: z.string().min(1, { error: "Confirme sua senha!" }),

    treinamento: z.string().min(1, { error: "Selecione um treinamento!" }),
    rgm: z.string().optional(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    error: "As senhas não coincidem!",
    path: ["confirmarSenha"],
  });

export type CadastroFormData = z.infer<typeof cadastroFormDataSchema>;
