import {
  ConfiguracoesCoordenador,
  ConfiguracoesRepository,
  DadosInstituicao,
  RegrassCertificado,
  PreferenciasGerais,
} from "../../domain/repositories/ConfiguracoesRepository";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";

export class ConfiguracoesUseCase {
  constructor(private configuracoeRepository: ConfiguracoesRepository) {}

  async obter(): Promise<ConfiguracoesCoordenador> {
    return await this.configuracoeRepository.obter();
  }

  async atualizarInstituicao(
    dados: DadosInstituicao,
    usuarioId: string,
  ): Promise<void> {
    if (!dados.nome?.trim()) {
      throw new BadRequestError("Nome da instituição é obrigatório.");
    }

    if (!dados.email?.trim()) {
      throw new BadRequestError("E-mail de contato é obrigatório.");
    }

    if (!dados.telefone?.trim()) {
      throw new BadRequestError("Telefone é obrigatório.");
    }

    if (!dados.cidade?.trim()) {
      throw new BadRequestError("Cidade é obrigatória.");
    }

    if (!dados.uf?.trim()) {
      throw new BadRequestError("UF é obrigatório.");
    }

    await this.configuracoeRepository.atualizarInstituicao(dados, usuarioId);
  }

  async atualizarPeriodoLetivo(periodo: string, usuarioId: string): Promise<void> {
    if (!periodo?.trim()) {
      throw new BadRequestError("Período letivo é obrigatório.");
    }

    // Validar formato: deve ser YYYY.S (ex: 2026.1 ou 2026.2)
    const regex = /^\d{4}\.[12]$/;
    if (!regex.test(periodo)) {
      throw new BadRequestError("Formato de período letivo inválido. Use: 2026.1 ou 2026.2");
    }

    await this.configuracoeRepository.atualizarPeriodoLetivo(periodo, usuarioId);
  }

  async atualizarRegrassCertificado(
    regras: RegrassCertificado,
    usuarioId: string,
  ): Promise<void> {
    if (typeof regras.maximoFaltas !== "number" || regras.maximoFaltas < 0) {
      throw new BadRequestError("Máximo de faltas deve ser um número não-negativo.");
    }

    if (typeof regras.apenasEncerrada !== "boolean") {
      throw new BadRequestError("Permitir apenas turmas encerradas deve ser verdadeiro ou falso.");
    }

    await this.configuracoeRepository.atualizarRegrassCertificado(regras, usuarioId);
  }

  async atualizarPreferenciasGerais(
    preferencias: PreferenciasGerais,
    usuarioId: string,
  ): Promise<void> {
    if (typeof preferencias.capacidadePadrao !== "number" || preferencias.capacidadePadrao <= 0) {
      throw new BadRequestError("Capacidade padrão deve ser um número maior que 0.");
    }

    if (!preferencias.statusPadrao?.trim()) {
      throw new BadRequestError("Status padrão é obrigatório.");
    }

    const statusValidos = ["planejamento", "em_andamento", "encerrada"];
    if (!statusValidos.includes(preferencias.statusPadrao)) {
      throw new BadRequestError(
        `Status padrão deve ser um de: ${statusValidos.join(", ")}`,
      );
    }

    await this.configuracoeRepository.atualizarPreferenciasGerais(preferencias, usuarioId);
  }
}
