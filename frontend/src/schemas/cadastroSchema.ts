import { z } from "zod/v4";

const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

export const cadastroFormDataSchema = z
  .object({
    nome: z.string().trim().min(3, { error: "Nome invalido!" }),
    cpf: z
      .string()
      .trim()
      .transform(somenteDigitos)
      .refine((valor) => valor.length === 11, { error: "CPF invalido!" })
      .refine((valor) => !/^(\d)\1+$/.test(valor), {
        error: "CPF invalido!",
      }),
    telefone: z
      .string()
      .trim()
      .transform(somenteDigitos)
      .refine((valor) => valor.length >= 10 && valor.length <= 11, {
        error: "Telefone invalido!",
      }),
    email: z
      .string()
      .trim()
      .transform((valor) => valor.toLowerCase())
      .refine((valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor), {
        error: "E-mail invalido!",
      }),
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
    cursoUnipe: z.string().trim().optional(),
    senha: z
      .string()
      .min(8, { error: "A senha deve ter no minimo 8 caracteres." })
      .regex(/[A-Za-z]/, { error: "A senha precisa ter uma letra." })
      .regex(/\d/, { error: "A senha precisa ter um numero." }),
    confirmarSenha: z.string().min(1, { error: "Confirme sua senha!" }),
    treinamento: z.string().min(1, { error: "Selecione um treinamento!" }),
    rgm: z.string().trim().transform(somenteDigitos).optional(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    error: "As senhas nao coincidem!",
    path: ["confirmarSenha"],
  })
  .superRefine((data, ctx) => {
    if (!data.isAlunoUnipe) {
      return;
    }

    if (!data.cursoUnipe) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o curso da UNIPE.",
        path: ["cursoUnipe"],
      });
    }

    if (!data.rgm || !/^\d{8}$/.test(data.rgm)) {
      ctx.addIssue({
        code: "custom",
        message: "RGM deve conter exatamente 8 digitos.",
        path: ["rgm"],
      });
    }
  });

export type CadastroFormData = z.infer<typeof cadastroFormDataSchema>;
