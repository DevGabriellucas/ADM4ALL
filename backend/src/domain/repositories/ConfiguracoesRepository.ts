export interface DadosInstituicao {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
}

export interface PeriodoLetivoConfig {
  valor: string; // Formato: "2026.1"
}

export interface RegrassCertificado {
  maximoFaltas: number;
  apenasEncerrada: boolean;
}

export interface PreferenciasGerais {
  capacidadePadrao: number;
  statusPadrao: string;
  nomeExibido?: string;
}

export interface ConfiguracoesCoordenador {
  instituicao: DadosInstituicao;
  periodoLetivo: PeriodoLetivoConfig;
  certificado: RegrassCertificado;
  preferencias: PreferenciasGerais;
}

export interface ConfiguracoesRepository {
  obter(): Promise<ConfiguracoesCoordenador>;
  atualizarInstituicao(dados: DadosInstituicao, usuarioId: string): Promise<void>;
  atualizarPeriodoLetivo(periodo: string, usuarioId: string): Promise<void>;
  atualizarRegrassCertificado(regras: RegrassCertificado, usuarioId: string): Promise<void>;
  atualizarPreferenciasGerais(preferencias: PreferenciasGerais, usuarioId: string): Promise<void>;
  obterValor(chave: string): Promise<string | null>;
  definirValor(chave: string, valor: string, usuarioId: string): Promise<void>;
}
