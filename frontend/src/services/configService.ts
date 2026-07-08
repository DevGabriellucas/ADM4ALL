import { apiClient } from "./apiClient";
import type {
  InstituicaoFormData,
  PeriodoLetivoFormData,
  CertificadoFormData,
  PreferenciasFormData,
  ConfiguracoesData,
} from "@/schemas/configuracionsSchema";

const API_URL = "/configuracoes";

interface ApiResponse {
  mensagem: string;
}

export const configService = {
  async obter(): Promise<ConfiguracoesData> {
    const response = await apiClient.get(API_URL);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.erro || error.mensagem || "Erro ao buscar configurações",
      );
    }
    return response.json();
  },

  async atualizarInstituicao(dados: InstituicaoFormData): Promise<ApiResponse> {
    const response = await apiClient.patch(
      `${API_URL}/instituicao`,
      dados,
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.erro || error.mensagem || "Erro ao atualizar instituição",
      );
    }
    return response.json();
  },

  async atualizarPeriodoLetivo(
    dados: PeriodoLetivoFormData,
  ): Promise<ApiResponse> {
    const response = await apiClient.patch(
      `${API_URL}/periodo-letivo`,
      dados,
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.erro || error.mensagem || "Erro ao atualizar período letivo",
      );
    }
    return response.json();
  },

  async atualizarCertificado(
    dados: CertificadoFormData,
  ): Promise<ApiResponse> {
    const response = await apiClient.patch(
      `${API_URL}/certificado`,
      dados,
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.erro || error.mensagem || "Erro ao atualizar regras de certificado",
      );
    }
    return response.json();
  },

  async atualizarPreferencias(
    dados: PreferenciasFormData,
  ): Promise<ApiResponse> {
    const response = await apiClient.patch(
      `${API_URL}/preferencias`,
      dados,
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.erro || error.mensagem || "Erro ao atualizar preferências",
      );
    }
    return response.json();
  },
};
