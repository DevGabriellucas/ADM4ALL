import { z } from "zod/v4";
import {
  isCpfValido,
  pareceCpfEmDigitacao,
  somenteDigitosCpf,
} from "@/utils/cpf";
import { primeiroErroSenha } from "@/utils/senha";

// A mesma regex do cadastro (schemas/cadastroSchema.ts): o e-mail digitado aqui
// precisa ter a forma do que foi cadastrado la, senao o campo acusa antes de
// mandar a tentativa para a API.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Quem tem senha antiga, fora das regras atuais, nao consegue mais entrar
// digitando a antiga: a saida e trocar a senha, e a mensagem diz isso em vez de
// so repetir a regra.
const DICA_DE_RECUPERACAO =
  'Se a sua senha é antiga, use "Esqueci minha senha" para criar uma nova.';

export const loginFormDataSchema = z.object({
  // Um campo, duas regras. O que decide qual vale e a forma do que foi
  // digitado: so numero e pontuacao = CPF; qualquer outra coisa = e-mail. O
  // valor sai daqui normalizado — CPF vira 11 digitos crus, que e o que a API
  // procura na coluna `usuarios.cpf`.
  identifier: z
    .string("Informe o e-mail ou o CPF.")
    .trim()
    .min(1, { error: "Informe o e-mail ou o CPF." })
    .superRefine((valor, ctx) => {
      if (pareceCpfEmDigitacao(valor)) {
        const digitos = somenteDigitosCpf(valor);

        if (digitos.length !== 11) {
          ctx.addIssue({
            code: "custom",
            message: "Informe os 11 dígitos do CPF.",
          });
          return;
        }

        if (!isCpfValido(digitos)) {
          ctx.addIssue({ code: "custom", message: "CPF inválido!" });
        }

        return;
      }

      if (!EMAIL_REGEX.test(valor)) {
        ctx.addIssue({ code: "custom", message: "E-mail inválido!" });
      }
    })
    .transform((valor) =>
      pareceCpfEmDigitacao(valor) ? somenteDigitosCpf(valor) : valor,
    ),
  password: z
    .string("A senha é obrigatória.")
    // Campo em branco tem erro próprio: sem o min(1) a mensagem exibida era
    // "A senha deve ter no mínimo 8 caracteres", que não é o problema.
    .min(1, { error: "A senha é obrigatória." })
    .superRefine((senha, ctx) => {
      // Campo vazio ja tem o erro do min(1); repetir a regra aqui mostraria
      // duas mensagens na mesma linha.
      if (senha === "") {
        return;
      }

      const erro = primeiroErroSenha(senha);

      if (erro) {
        ctx.addIssue({
          code: "custom",
          message: `${erro} ${DICA_DE_RECUPERACAO}`,
        });
      }
    }),
});

export type LoginFormData = z.infer<typeof loginFormDataSchema>;
