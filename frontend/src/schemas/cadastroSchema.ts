import { z } from "zod/v4";
import { isCpfValido } from "@/utils/cpf";
import { primeiroErroSenha } from "@/utils/senha";

const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

export const cadastroFormDataSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .transform((valor) => valor.replace(/\s+/g, " "))
      .refine((valor) => valor.length >= 3, { error: "Nome inválido!" })
      .refine((valor) => nomeRegex.test(valor), {
        error: "Informe apenas letras e espaços.",
      })
      .refine((valor) => valor.split(" ").length >= 2, {
        error: "Informe nome e sobrenome.",
      }),
    cpf: z
      .string()
      .trim()
      .transform(somenteDigitos)
      .refine((valor) => valor.length === 11, { error: "CPF inválido!" })
      .refine((valor) => isCpfValido(valor), {
        error: "CPF inválido!",
      }),
    telefone: z
      .string()
      .trim()
      .transform(somenteDigitos)
      .refine((valor) => valor.length >= 10 && valor.length <= 11, {
        error: "Telefone inválido!",
      }),
    email: z
      .string()
      .trim()
      .transform((valor) => valor.toLowerCase())
      .refine((valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor), {
        error: "E-mail inválido!",
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
    senha: z.string().superRefine((valor, ctx) => {
      const erro = primeiroErroSenha(valor);
      if (erro) {
        ctx.addIssue({ code: "custom", message: erro });
      }
    }),
    confirmarSenha: z.string().min(1, { error: "Confirme sua senha!" }),
    treinamento: z.string().min(1, { error: "Selecione um treinamento!" }),
    rgm: z.string().trim().transform(somenteDigitos).optional(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    error: "As senhas não coincidem!",
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
