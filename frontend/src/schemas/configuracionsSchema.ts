import { z } from "zod";

export const instituicaoSchema = z.object({
  nome: z.string().min(1, "Nome da instituição é obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 caracteres").toUpperCase(),
});

export const periodoLetivoSchema = z.object({
  valor: z
    .string()
    .regex(/^\d{4}\.[12]$/, "Formato inválido. Use: 2026.1 ou 2026.2"),
});

export const certificadoSchema = z.object({
  maximoFaltas: z.number().min(0, "Máximo de faltas deve ser não-negativo"),
  apenasEncerrada: z.boolean(),
});

export const preferencesSchema = z.object({
  capacidadePadrao: z.number().min(1, "Capacidade padrão deve ser maior que 0"),
  statusPadrao: z.enum(["planejamento", "em_andamento", "encerrada"]),
  nomeExibido: z.string().optional(),
});

export const configuracionsSchema = z.object({
  instituicao: instituicaoSchema,
  periodoLetivo: z.object({
    valor: z.string(),
  }),
  certificado: certificadoSchema,
  preferencias: preferencesSchema,
});

export type InstituicaoFormData = z.infer<typeof instituicaoSchema>;
export type PeriodoLetivoFormData = z.infer<typeof periodoLetivoSchema>;
export type CertificadoFormData = z.infer<typeof certificadoSchema>;
export type PreferenciasFormData = z.infer<typeof preferencesSchema>;
export type ConfiguracoesData = z.infer<typeof configuracionsSchema>;
