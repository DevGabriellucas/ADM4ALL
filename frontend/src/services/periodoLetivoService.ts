// ATENCAO: modulo de uso exclusivo do servidor. Ele le cookies de sessao
// e por isso so deve ser importado por Server Components ou Server Actions,
// nunca por componentes "use client".
import { authenticatedRequest } from "@/services/apiClient";

export interface PeriodoLetivoResponse {
  periodoLetivo: string;
  origem: "automatico" | "manual";
  atualizadoEm?: string | null;
  atualizadoPor?: string | null;
}

export const getPeriodoLetivo =
  async (): Promise<PeriodoLetivoResponse> => {
    return await authenticatedRequest<PeriodoLetivoResponse>(
      "/coordenador/periodo-letivo",
      {
        cache: "no-store",
        fallbackError: "Falha ao carregar o periodo letivo.",
      },
    );
  };

export const atualizarPeriodoLetivo = async (
  periodoLetivo: string,
): Promise<PeriodoLetivoResponse> => {
  return await authenticatedRequest<PeriodoLetivoResponse>(
    "/coordenador/periodo-letivo",
    {
      method: "PATCH",
      body: JSON.stringify({ periodoLetivo }),
      fallbackError: "Falha ao atualizar o periodo letivo.",
    },
  );
};
