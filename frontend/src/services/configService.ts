import type {
  CertificadoFormData,
  ConfiguracoesData,
  InstituicaoFormData,
  PeriodoLetivoFormData,
  PreferenciasFormData,
} from "@/schemas/configuracionsSchema";
import { authenticatedRequest } from "./apiClient";

interface ApiResponse {
  mensagem: string;
}

export const configService = {
  async obter(): Promise<ConfiguracoesData> {
    return authenticatedRequest<ConfiguracoesData>("/configuracoes", {
      cache: "no-store",
      fallbackError: "Erro ao buscar configurações",
    });
  },

  async atualizarInstituicao(dados: InstituicaoFormData): Promise<ApiResponse> {
    return authenticatedRequest<ApiResponse>("/configuracoes/instituicao", {
      method: "PATCH",
      body: JSON.stringify(dados),
      fallbackError: "Erro ao atualizar instituição",
    });
  },

  async atualizarPeriodoLetivo(
    dados: PeriodoLetivoFormData,
  ): Promise<ApiResponse> {
    return authenticatedRequest<ApiResponse>("/configuracoes/periodo-letivo", {
      method: "PATCH",
      body: JSON.stringify(dados),
      fallbackError: "Erro ao atualizar período letivo",
    });
  },

  async atualizarCertificado(dados: CertificadoFormData): Promise<ApiResponse> {
    return authenticatedRequest<ApiResponse>("/configuracoes/certificado", {
      method: "PATCH",
      body: JSON.stringify(dados),
      fallbackError: "Erro ao atualizar regras de certificado",
    });
  },

  async atualizarPreferencias(
    dados: PreferenciasFormData,
  ): Promise<ApiResponse> {
    return authenticatedRequest<ApiResponse>("/configuracoes/preferencias", {
      method: "PATCH",
      body: JSON.stringify(dados),
      fallbackError: "Erro ao atualizar preferências",
    });
  },
};
