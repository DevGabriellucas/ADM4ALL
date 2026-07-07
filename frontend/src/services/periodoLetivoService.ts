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

const calcularPeriodoLetivoAtual = () => {
  const hoje = new Date();
  const semestre = hoje.getMonth() < 6 ? "1" : "2";
  return `${hoje.getFullYear()}.${semestre}`;
};

export const getPeriodoLetivoSeguro =
  async (): Promise<PeriodoLetivoResponse> => {
    try {
      return await getPeriodoLetivo();
    } catch {
      return {
        periodoLetivo: calcularPeriodoLetivoAtual(),
        origem: "automatico",
        atualizadoEm: null,
        atualizadoPor: null,
      };
    }
  };

export const getPeriodoLetivo = async (): Promise<PeriodoLetivoResponse> => {
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
