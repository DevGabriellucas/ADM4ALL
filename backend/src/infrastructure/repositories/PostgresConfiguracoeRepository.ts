import { Pool } from "pg";
import {
  ConfiguracoesCoordenador,
  ConfiguracoesRepository,
  DadosInstituicao,
  PeriodoLetivoConfig,
  RegrassCertificado,
  PreferenciasGerais,
} from "../../domain/repositories/ConfiguracoesRepository";

export class PostgresConfiguracoeRepository implements ConfiguracoesRepository {
  private chaves = {
    INSTITUICAO_NOME: "instituicao_nome",
    INSTITUICAO_EMAIL: "instituicao_email",
    INSTITUICAO_TELEFONE: "instituicao_telefone",
    INSTITUICAO_CIDADE: "instituicao_cidade",
    INSTITUICAO_UF: "instituicao_uf",
    PERIODO_LETIVO: "periodo_letivo",
    CERTIFICADO_MAXIMO_FALTAS: "certificado_maximo_faltas",
    CERTIFICADO_APENAS_ENCERRADA: "certificado_apenas_encerrada",
    PREFERENCIAS_CAPACIDADE_PADRAO: "preferencias_capacidade_padrao",
    PREFERENCIAS_STATUS_PADRAO: "preferencias_status_padrao",
    PREFERENCIAS_NOME_EXIBIDO: "preferencias_nome_exibido",
  };

  constructor(private db: Pool) {}

  async obter(): Promise<ConfiguracoesCoordenador> {
    const instituicao = await this.obterDadosInstituicao();
    const periodoLetivo = await this.obterPeriodoLetivo();
    const certificado = await this.obterRegrassCertificado();
    const preferencias = await this.obterPreferenciasGerais();

    return {
      instituicao,
      periodoLetivo,
      certificado,
      preferencias,
    };
  }

  async obterValor(chave: string): Promise<string | null> {
    const query = "SELECT valor FROM configuracoes_sistema WHERE chave = $1";
    const resultado = await this.db.query(query, [chave]);
    return resultado.rows[0]?.valor ?? null;
  }

  async definirValor(chave: string, valor: string, usuarioId: string): Promise<void> {
    const query = `
      INSERT INTO configuracoes_sistema (chave, valor, atualizado_por_id, atualizado_em)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (chave) DO UPDATE 
      SET valor = $2, atualizado_por_id = $3, atualizado_em = NOW()
    `;
    await this.db.query(query, [chave, valor, usuarioId]);
  }

  async atualizarInstituicao(dados: DadosInstituicao, usuarioId: string): Promise<void> {
    const queries = [
      this.definirValor(this.chaves.INSTITUICAO_NOME, dados.nome, usuarioId),
      this.definirValor(this.chaves.INSTITUICAO_EMAIL, dados.email, usuarioId),
      this.definirValor(this.chaves.INSTITUICAO_TELEFONE, dados.telefone, usuarioId),
      this.definirValor(this.chaves.INSTITUICAO_CIDADE, dados.cidade, usuarioId),
      this.definirValor(this.chaves.INSTITUICAO_UF, dados.uf, usuarioId),
    ];
    await Promise.all(queries);
  }

  async atualizarPeriodoLetivo(periodo: string, usuarioId: string): Promise<void> {
    await Promise.all([
      this.definirValor(this.chaves.PERIODO_LETIVO, periodo, usuarioId),
      this.definirValor("periodo_letivo_atual", periodo, usuarioId),
    ]);
  }

  async atualizarRegrassCertificado(regras: RegrassCertificado, usuarioId: string): Promise<void> {
    const queries = [
      this.definirValor(
        this.chaves.CERTIFICADO_MAXIMO_FALTAS,
        String(regras.maximoFaltas),
        usuarioId,
      ),
      this.definirValor(
        this.chaves.CERTIFICADO_APENAS_ENCERRADA,
        regras.apenasEncerrada ? "true" : "false",
        usuarioId,
      ),
    ];
    await Promise.all(queries);
  }

  async atualizarPreferenciasGerais(
    preferencias: PreferenciasGerais,
    usuarioId: string,
  ): Promise<void> {
    const queries = [
      this.definirValor(
        this.chaves.PREFERENCIAS_CAPACIDADE_PADRAO,
        String(preferencias.capacidadePadrao),
        usuarioId,
      ),
      this.definirValor(
        this.chaves.PREFERENCIAS_STATUS_PADRAO,
        preferencias.statusPadrao,
        usuarioId,
      ),
    ];

    if (preferencias.nomeExibido) {
      queries.push(
        this.definirValor(
          this.chaves.PREFERENCIAS_NOME_EXIBIDO,
          preferencias.nomeExibido,
          usuarioId,
        ),
      );
    }

    await Promise.all(queries);
  }

  private async obterDadosInstituicao(): Promise<DadosInstituicao> {
    const nome = (await this.obterValor(this.chaves.INSTITUICAO_NOME)) ?? "ADM4All";
    const email = (await this.obterValor(this.chaves.INSTITUICAO_EMAIL)) ?? "";
    const telefone = (await this.obterValor(this.chaves.INSTITUICAO_TELEFONE)) ?? "";
    const cidade = (await this.obterValor(this.chaves.INSTITUICAO_CIDADE)) ?? "";
    const uf = (await this.obterValor(this.chaves.INSTITUICAO_UF)) ?? "";

    return { nome, email, telefone, cidade, uf };
  }

  private async obterPeriodoLetivo(): Promise<PeriodoLetivoConfig> {
    const valor = (await this.obterValor(this.chaves.PERIODO_LETIVO)) ?? "2026.1";
    return { valor };
  }

  private async obterRegrassCertificado(): Promise<RegrassCertificado> {
    const maximoFaltas = parseInt(
      (await this.obterValor(this.chaves.CERTIFICADO_MAXIMO_FALTAS)) ?? "2",
      10,
    );
    const apenasEncerrada =
      (await this.obterValor(this.chaves.CERTIFICADO_APENAS_ENCERRADA)) === "true";

    return { maximoFaltas, apenasEncerrada };
  }

  private async obterPreferenciasGerais(): Promise<PreferenciasGerais> {
    const capacidadePadrao = parseInt(
      (await this.obterValor(this.chaves.PREFERENCIAS_CAPACIDADE_PADRAO)) ?? "30",
      10,
    );
    const statusPadraoRaw = (await this.obterValor(this.chaves.PREFERENCIAS_STATUS_PADRAO)) ?? "planejada";
    const statusPadrao = statusPadraoRaw === "planejamento" ? "planejada" : statusPadraoRaw;
    const nomeExibido = (await this.obterValor(this.chaves.PREFERENCIAS_NOME_EXIBIDO)) ?? "";

    return { capacidadePadrao, statusPadrao, nomeExibido };
  }
}
