import bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import {
  ActivationRepository,
  CampoPendenteAtivacao,
  ConfirmarAtivacaoInput,
  OrigemAtivacao,
} from "../../domain/repositories/ActivationRepository";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { validarSenhaForte } from "../utils/validarSenha";

const SALT_ROUNDS = 10;
const ATIVACAO_DIAS = 3;

export interface ConfirmarAtivacaoDados {
  senha?: string;
  confirmarSenha?: string;
  whatsapp?: string;
  rgm?: string;
  cursoUnipe?: string;
  areaAtuacao?: string;
  formacao?: string;
}

export class ActivationUseCase {
  constructor(private activationRepository: ActivationRepository) {}

  async criar(
    usuarioId: string,
    origem: OrigemAtivacao,
    camposPendentes: CampoPendenteAtivacao[],
  ): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(token);
    const expiraEm = new Date(
      Date.now() + ATIVACAO_DIAS * 24 * 60 * 60 * 1000,
    );

    await this.activationRepository.registrar({
      usuarioId,
      tokenHash,
      origem,
      camposPendentes,
      expiraEm,
    });

    return token;
  }

  async validar(token: string) {
    const ativacao = await this.buscarAtivacaoValida(token);

    return {
      tokenValido: true,
      perfil: ativacao.perfil,
      origem: ativacao.origem,
      nome: ativacao.nome,
      email: ativacao.email,
      camposPendentes: ativacao.camposPendentes,
    };
  }

  async confirmar(
    token: string,
    dados: ConfirmarAtivacaoDados = {},
  ): Promise<void> {
    const ativacao = await this.buscarAtivacaoValida(token);
    const campos = new Set(ativacao.camposPendentes);

    const senha = dados.senha?.trim();
    if (campos.has("senha")) {
      validarSenhaForte(senha);
      if (senha !== dados.confirmarSenha) {
        throw new BadRequestError(
          "Senha e confirmacao de senha nao conferem.",
        );
      }
    }

    const whatsapp = dados.whatsapp?.replace(/\D/g, "");
    if (
      campos.has("whatsapp") &&
      (!whatsapp || whatsapp.length < 10 || whatsapp.length > 11)
    ) {
      throw new BadRequestError("Informe um WhatsApp valido.");
    }

    this.validarCampoObrigatorio(campos, "areaAtuacao", dados.areaAtuacao);
    this.validarCampoObrigatorio(campos, "formacao", dados.formacao);

    const rgm = dados.rgm?.trim();
    if (rgm && !/^\d{8}$/.test(rgm)) {
      throw new BadRequestError("O RGM deve conter exatamente 8 digitos.");
    }

    const cursoUnipe = dados.cursoUnipe?.trim();
    if ((rgm && !cursoUnipe) || (!rgm && cursoUnipe)) {
      throw new BadRequestError(
        "Informe o RGM e o curso Unipe em conjunto.",
      );
    }

    const dadosConfirmacao: ConfirmarAtivacaoInput = {};
    if (senha) {
      dadosConfirmacao.senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    }
    if (whatsapp) dadosConfirmacao.whatsapp = whatsapp;
    if (rgm) dadosConfirmacao.rgm = rgm;
    if (cursoUnipe) dadosConfirmacao.cursoUnipe = cursoUnipe;
    if (dados.areaAtuacao?.trim()) {
      dadosConfirmacao.areaAtuacao = dados.areaAtuacao.trim();
    }
    if (dados.formacao?.trim()) {
      dadosConfirmacao.formacao = dados.formacao.trim();
    }

    const confirmado = await this.activationRepository.confirmar(
      this.hashToken(token),
      ativacao.perfil,
      dadosConfirmacao,
    );

    if (!confirmado) {
      throw new BadRequestError("Token ja utilizado.");
    }
  }

  private async buscarAtivacaoValida(token: string) {
    if (!token || token.trim() === "") {
      throw new BadRequestError("Token de ativacao invalido ou expirado.");
    }

    const ativacao = await this.activationRepository.buscarPorTokenHash(
      this.hashToken(token),
    );

    if (!ativacao) {
      throw new BadRequestError("Token de ativacao invalido ou expirado.");
    }
    if (ativacao.usadoEm) {
      throw new BadRequestError("Token ja utilizado.");
    }
    if (ativacao.expiraEm.getTime() <= Date.now()) {
      throw new BadRequestError("Token de ativacao invalido ou expirado.");
    }

    return ativacao;
  }

  private validarCampoObrigatorio(
    campos: Set<CampoPendenteAtivacao>,
    campo: "areaAtuacao" | "formacao",
    valor?: string,
  ) {
    if (campos.has(campo) && (!valor || valor.trim() === "")) {
      const rotulo = campo === "areaAtuacao" ? "area de atuacao" : "formacao";
      throw new BadRequestError(`Informe a ${rotulo}.`);
    }
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token.trim()).digest("hex");
  }
}
