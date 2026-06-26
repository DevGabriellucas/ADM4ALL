import { z } from "zod/v4";

export const cadastroFormDataSchema = z.object({
  nome: z.string().trim().min(3, { error: "Nome inválido!" }),
  cpf: z.string().trim().length(11, { error: "CPF inválido!" }),
  telefone: z.string().trim().min(10, { error: "Telefone inválido!" }),
  email: z.email({ error: "Email inválido!" }),
  dataNascimento: z.string(),
  isAlunoUnipe: z.boolean(),
  cursoUnipe: z.string().optional(),
  
  senha: z.string().min(1, { error: "A senha é obrigatória!" }),
  confirmarSenha: z.string().min(1, { error: "Confirme sua senha!" }),

  treinamento: z.string().min(1, { error: "Selecione um treinamento!" }),
  rgm: z.string().optional() 
}).refine((data) => data.senha === data.confirmarSenha, {
  error: "As senhas não coincidem!",
  path: ["confirmarSenha"],
});

export type CadastroFormData = z.infer<typeof cadastroFormDataSchema>;