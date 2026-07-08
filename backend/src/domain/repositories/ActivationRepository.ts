export type PerfilAtivacao = "aluno" | "instrutor" | "coordenador";

export type OrigemAtivacao =
  | "cadastro_publico"
  | "criado_por_coordenador"
  | "criado_por_admin";

export type CampoPendenteAtivacao =
  | "senha"
  | "whatsapp"
  | "rgm"
  | "cursoUnipe"
  | "areaAtuacao"
  | "formacao"
  | "areaCoordenacao";

export interface RegistrarAtivacaoInput {
  usuarioId: string;
  tokenHash: string;
  origem: OrigemAtivacao;
  camposPendentes: CampoPendenteAtivacao[];
  expiraEm: Date;
}

export interface AtivacaoConta {
  usuarioId: string;
  perfil: PerfilAtivacao;
  origem: OrigemAtivacao;
  nome: string;
  email: string;
  camposPendentes: CampoPendenteAtivacao[];
  expiraEm: Date;
  usadoEm: Date | null;
}

export interface ConfirmarAtivacaoInput {
  senhaHash?: string;
  whatsapp?: string;
  rgm?: string;
  cursoUnipe?: string;
  areaAtuacao?: string;
  formacao?: string;
}

export interface ActivationRepository {
  registrar(input: RegistrarAtivacaoInput): Promise<void>;
  buscarPorTokenHash(tokenHash: string): Promise<AtivacaoConta | null>;
  confirmar(
    tokenHash: string,
    perfil: PerfilAtivacao,
    dados: ConfirmarAtivacaoInput,
  ): Promise<boolean>;
}
