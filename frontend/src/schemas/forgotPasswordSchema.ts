import { z } from "zod/v4";

export const forgotPasswordDataSchema = z.object({
  email: z
    .email({ message: "E-mail inválido!" })
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordDataSchema>;

