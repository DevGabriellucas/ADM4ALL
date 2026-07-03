export type ActivationProfile = "aluno" | "instrutor" | "coordenador";

export type ActivationOrigin =
  | "cadastro_publico"
  | "criado_por_coordenador"
  | "criado_por_admin";

export type ActivationPendingField =
  | "senha"
  | "whatsapp"
  | "rgm"
  | "cursoUnipe"
  | "areaAtuacao"
  | "formacao";

export interface ActivationTokenResponse {
  tokenValido: true;
  perfil: ActivationProfile;
  origem: ActivationOrigin;
  nome: string;
  email: string;
  camposPendentes: ActivationPendingField[];
}

export interface ActivateAccountPayload {
  senha?: string;
  confirmarSenha?: string;
  whatsapp?: string;
  rgm?: string;
  cursoUnipe?: string;
  areaAtuacao?: string;
  formacao?: string;
}

export interface ActivateAccountResponse {
  mensagem: string;
}
