import bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import { Aluno, AlunoProps } from "../../domain/entities/Aluno";
import {
  AlunoDashboard,
  AlunoRepository,
  CertificadoEmitidoDoAluno,
  MaterialAluno,
  MaterialAlunoDownload,
  MaterialVisivelAluno,
} from "../../domain/repositories/AlunoRepository";
import type { CertificadoAlunoDetalhe } from "../../domain/repositories/CoordenadorRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";
import { getRequiredEnv } from "../../infrastructure/config/env";
import { getCertificadosStorageDir } from "../../infrastructure/config/storage";
import { EmailService } from "../../infrastructure/email/EmailService";
import { gerarEmailRecuperacaoSenha } from "../../infrastructure/email/emailTemplates";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { UnauthorizedError } from "../../infrastructure/errors/UnauthorizedError";
import { gerarCertificadoPdf } from "../../infrastructure/pdf/CertificatePdfService";
import { ActivationUseCase } from "./ActivationUseCase";

export interface CadastrarAlunoInput {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataNascimento: Date | string;
  isAlunoUnipe: boolean;
  cursoUnipe?: string | undefined;
  senha: string;
  treinamento: string;
  rgm?: string | undefined;
}

export interface CadastrarAlunoOutput {
  aluno: Aluno;
  linkAtivacao: string;
  emailEnviado: boolean;
  erroEnvioEmail?: string;
}

export interface AtualizarAlunoInput {
  cpf?: string;
  nome?: string;
  telefone?: string;
  email?: string;
  dataNascimento?: Date | string;
  isAlunoUnipe?: boolean;
  cursoUnipe?: string | null;
  senha?: string;
  treinamento?: string;
  rgm?: string | null;
}

export interface RecuperarSenhaContexto {
  ipSolicitante?: string | undefined;
  userAgent?: string | undefined;
}

const RECUPERACAO_SENHA_MINUTOS = 15;
const SALT_ROUNDS = 10;

export class AlunoUseCase {
  constructor(
    private alunoRepository: AlunoRepository,
    private emailService: EmailService,
    private activationUseCase: ActivationUseCase,
  ) {}

  async cadastrar(dados: CadastrarAlunoInput): Promise<CadastrarAlunoOutput> {
    const dadosNormalizados = this.normalizarCadastro(dados);
    const cpfVo = this.criarCpf(dadosNormalizados.cpf);
    const telefoneVo = this.criarTelefone(dadosNormalizados.telefone);
    const emailVo = this.criarEmail(dadosNormalizados.email);
    const dataNascimento = this.normalizarDataNascimento(dados.dataNascimento);

    const cpfExistente = await this.alunoRepository.buscarPorCpf(cpfVo.value);
    if (cpfExistente) {
      throw new BadRequestError("Ja existe um aluno cadastrado com este CPF.");
    }

    const emailExistente = await this.alunoRepository.buscarPorEmail(
      emailVo.value,
    );
    if (emailExistente) {
      throw new BadRequestError(
        "Ja existe um aluno cadastrado com este e-mail.",
      );
    }

    const senhaCriptografada = await this.criptografarSenha(
      dadosNormalizados.senha,
    );

    const novoAluno = new Aluno({
      ...dadosNormalizados,
      cpf: cpfVo,
      telefone: telefoneVo,
      email: emailVo,
      dataNascimento,
      senha: senhaCriptografada,
    });

    const aluno = await this.alunoRepository.cadastrar(novoAluno);
    const usuarioId = await this.alunoRepository.buscarUsuarioIdPorAlunoId(
      aluno.id,
    );

    if (!usuarioId) {
      throw new Error("Usuario do aluno cadastrado nao encontrado.");
    }

    const token = await this.activationUseCase.criar(
      usuarioId,
      "cadastro_publico",
      [],
    );
    const frontendUrl = getRequiredEnv("FRONTEND_URL");
    const linkAtivacao = `${frontendUrl}/ativar-conta?token=${token}`;

    let emailEnviado = true;
    let erroEnvioEmail: string | undefined;

    try {
      await this.emailService.enviar(
        aluno.email,
        "Ative sua conta - ADM Para Todos",
        `<p>Ola, ${aluno.nome}!</p>
         <p>Confirme seu e-mail para ativar sua conta.</p>
         <p><a href="${linkAtivacao}">Ativar minha conta</a></p>
         <p>Este link expira em 3 dias.</p>`,
      );
    } catch (error) {
      emailEnviado = false;
      erroEnvioEmail =
        error instanceof Error ? error.message : "Falha ao enviar e-mail.";
      console.error("Falha ao enviar e-mail de ativacao:", error);
    }

    return {
      aluno,
      linkAtivacao,
      emailEnviado,
      ...(erroEnvioEmail ? { erroEnvioEmail } : {}),
    };
  }

  async listar(): Promise<Aluno[]> {
    return await this.alunoRepository.listarTodos();
  }

  async buscarPorId(id: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.buscarPorId(id);
    if (!aluno) {
      throw new BadRequestError("Aluno nao encontrado.");
    }
    return aluno;
  }

  async obterDashboard(alunoId: string): Promise<AlunoDashboard> {
    const dashboard =
      await this.alunoRepository.buscarDashboardPorAlunoId(alunoId);

    if (!dashboard) {
      throw new BadRequestError(
        "O aluno nao possui matricula disponivel para o dashboard.",
      );
    }

    return dashboard;
  }

  async listarMateriaisVisiveis(
    alunoId: string,
  ): Promise<MaterialVisivelAluno[]> {
    if (!alunoId) {
      throw new UnauthorizedError("Aluno autenticado nao encontrado.");
    }

    return await this.alunoRepository.listarMateriaisVisiveis(alunoId);
  }

  async listarMateriais(alunoId: string): Promise<MaterialAluno[]> {
    return await this.alunoRepository.listarMateriaisVisiveisPorAluno(alunoId);
  }

  async buscarMaterialParaDownload(
    alunoId: string,
    materialId: string,
  ): Promise<MaterialAlunoDownload | null> {
    return await this.alunoRepository.buscarMaterialVisivelParaDownload(
      alunoId,
      materialId,
    );
  }

  async baixarCertificado(
    alunoId: string,
  ): Promise<{ buffer: Buffer; nomeArquivo: string }> {
    const cert =
      await this.alunoRepository.buscarCertificadoEmitidoPorAlunoId(alunoId);

    if (!cert) {
      throw new BadRequestError(
        "Nenhum certificado emitido encontrado para este aluno.",
      );
    }

    const codigoSeguro = (cert.codigo ?? "certificado").replace(
      /[^a-zA-Z0-9_-]/g,
      "-",
    );

    // O aluno guarda esse arquivo: o nome traz o curso, nao so o codigo.
    // Acentos e cedilha saem para o nome nao quebrar em outros sistemas.
    const cursoSeguro = (cert.nomeCurso ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();

    const nomeArquivo = cursoSeguro
      ? `certificado-${cursoSeguro}-${codigoSeguro}.pdf`
      : `certificado-aluno-${codigoSeguro}.pdf`;

    const certificadosDir = getCertificadosStorageDir();

    const ehLegado =
      cert.urlArquivo?.startsWith("/uploads/certificados/") === true;

    if (cert.urlArquivo && !ehLegado) {
      const caminhoRelativo = cert.urlArquivo.replace(
        /^\/storage\/certificados\//,
        "",
      );
      const caminhoAbsoluto = path.resolve(certificadosDir, caminhoRelativo);

      if (caminhoAbsoluto.startsWith(certificadosDir + path.sep)) {
        try {
          await fs.access(caminhoAbsoluto);
          const buffer = await fs.readFile(caminhoAbsoluto);
          return { buffer, nomeArquivo };
        } catch {
          console.warn(
            "Arquivo do certificado nao encontrado em disco. Gerando fallback.",
          );
        }
      }
    }

    const detalhe: CertificadoAlunoDetalhe = {
      tipo: "aluno",
      certificadoId: cert.certificadoId,
      referenciaId: "",
      status: "emitido",
      urlArquivo: cert.urlArquivo ?? null,
      nomeAluno: cert.nomeAluno,
      cpfAluno: cert.cpfAluno,
      nomeCurso: cert.nomeCurso,
      cargaHoraria: cert.cargaHoraria,
      dataInicio: cert.dataInicio,
      dataFim: cert.dataFim,
      dataEmissao: cert.dataEmissao,
      cidade: cert.cidade,
      nomeCoordenadora: cert.nomeCoordenadora,
      nomeProjeto: cert.nomeProjeto,
      textoDescritivo: cert.textoDescritivo,
      codigo: cert.codigo,
      statusMatricula: "",
      statusTurma: "",
      statusUsuario: "",
      faltas: 0,
    };

    const pdf = await gerarCertificadoPdf(detalhe);

    try {
      await fs.mkdir(certificadosDir, { recursive: true });
      const arquivoNome = `cert-${codigoSeguro}.pdf`;
      const arquivoCaminho = path.join(certificadosDir, arquivoNome);
      await fs.writeFile(arquivoCaminho, pdf);
      const urlArquivo = `/storage/certificados/${arquivoNome}`;
      await this.alunoRepository.atualizarUrlArquivoCertificado(
        cert.certificadoId,
        urlArquivo,
      );
    } catch (erroSalvar) {
      console.error(
        "Falha ao persistir PDF do certificado no fallback:",
        erroSalvar,
      );
    }

    return { buffer: pdf, nomeArquivo };
  }

  async atualizar(
    id: string,
    dadosAtualizados: AtualizarAlunoInput,
  ): Promise<Aluno> {
    if (dadosAtualizados.cpf !== undefined) {
      throw new BadRequestError("CPF nao pode ser alterado.");
    }

    const aluno = await this.buscarPorId(id);
    const novosDados: Partial<Omit<AlunoProps, "id" | "cpf">> = {};

    if (dadosAtualizados.nome !== undefined) {
      novosDados.nome = dadosAtualizados.nome;
    }

    if (dadosAtualizados.telefone !== undefined) {
      novosDados.telefone = new Telefone(dadosAtualizados.telefone);
    }

    if (dadosAtualizados.email !== undefined) {
      const emailVo = new Email(dadosAtualizados.email);

      if (emailVo.value !== aluno.email) {
        const alunoComEmail = await this.alunoRepository.buscarPorEmail(
          emailVo.value,
        );
        if (alunoComEmail && alunoComEmail.id !== aluno.id) {
          throw new BadRequestError(
            "Ja existe um aluno cadastrado com este e-mail.",
          );
        }
      }

      novosDados.email = emailVo;
    }

    if (dadosAtualizados.dataNascimento !== undefined) {
      novosDados.dataNascimento = this.normalizarDataNascimento(
        dadosAtualizados.dataNascimento,
      );
    }

    if (dadosAtualizados.senha !== undefined) {
      novosDados.senha = await this.criptografarSenha(dadosAtualizados.senha);
    }

    if (dadosAtualizados.treinamento !== undefined) {
      novosDados.treinamento = dadosAtualizados.treinamento;
    }

    const isAlunoUnipe = dadosAtualizados.isAlunoUnipe ?? aluno.isAlunoUnipe;
    novosDados.isAlunoUnipe = isAlunoUnipe;

    if (isAlunoUnipe) {
      novosDados.cursoUnipe =
        dadosAtualizados.cursoUnipe !== undefined
          ? dadosAtualizados.cursoUnipe ?? undefined
          : aluno.cursoUnipe;
      novosDados.rgm =
        dadosAtualizados.rgm !== undefined
          ? dadosAtualizados.rgm ?? undefined
          : aluno.rgm;
    } else {
      novosDados.cursoUnipe = undefined;
      novosDados.rgm = undefined;
    }

    aluno.update(novosDados);
    return await this.alunoRepository.atualizar(aluno);
  }

  async deletar(id: string): Promise<void> {
    await this.buscarPorId(id);
    await this.alunoRepository.deletar(id);
  }

  async recuperarSenha(
    emailBruto: string,
    contexto: RecuperarSenhaContexto = {},
  ): Promise<void> {
    const emailVo = new Email(emailBruto);
    const usuario = await this.alunoRepository.buscarUsuarioPorEmail(
      emailVo.value,
    );

    if (!usuario) {
      return;
    }

    // Rate limit: uma solicitacao por janela de expiracao. Sem isso, cada clique
    // gerava um token e disparava outro e-mail — dava para inundar a caixa do
    // aluno e queimar a cota diaria do provedor de e-mail.
    //
    // Sai em silencio, igual ao caso de e-mail inexistente: a resposta ao
    // usuario e sempre a mesma ("se o e-mail estiver cadastrado..."), entao a
    // tela nao revela se a conta existe nem se ja havia pedido em andamento.
    const jaSolicitouRecentemente =
      await this.alunoRepository.existeRecuperacaoSenhaRecente(
        usuario.id,
        RECUPERACAO_SENHA_MINUTOS,
      );

    if (jaSolicitouRecentemente) {
      return;
    }

    const tokenDeRecuperacao = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256")
      .update(tokenDeRecuperacao)
      .digest("hex");
    const expiraEm = new Date(
      Date.now() + RECUPERACAO_SENHA_MINUTOS * 60 * 1000,
    );

    await this.alunoRepository.registrarRecuperacaoSenha({
      usuarioId: usuario.id,
      tokenHash,
      expiraEm,
      ipSolicitante: contexto.ipSolicitante,
      userAgent: contexto.userAgent,
    });

    const frontendUrl = getRequiredEnv("FRONTEND_URL");
    const linkRedefinicao = `${frontendUrl}/redefinir-senha?token=${tokenDeRecuperacao}`;

    try {
      await this.emailService.enviar(
        usuario.email,
        "Recuperacao de Senha - ADM Para Todos",
        gerarEmailRecuperacaoSenha(linkRedefinicao, RECUPERACAO_SENHA_MINUTOS),
      );
    } catch (error) {
      await this.alunoRepository.removerRecuperacaoSenhaPorTokenHash(tokenHash);
      throw error;
    }
  }

  async redefinirSenha(tokenBruto: string, novaSenha: string): Promise<void> {
    if (!tokenBruto || tokenBruto.trim() === "") {
      throw new BadRequestError("O token de redefinicao e obrigatorio.");
    }

    if (!novaSenha || novaSenha.length < 8) {
      throw new BadRequestError("A senha deve ter no mínimo 8 caracteres.");
    }

    const tokenHash = createHash("sha256")
      .update(tokenBruto.trim())
      .digest("hex");

    const recuperacao =
      await this.alunoRepository.buscarRecuperacaoValidaPorTokenHash(tokenHash);

    if (!recuperacao) {
      throw new BadRequestError("Link de redefinicao invalido ou expirado.");
    }

    const novaSenhaCriptografada = await this.criptografarSenha(novaSenha);

    await this.alunoRepository.redefinirSenhaUsuario(
      recuperacao.usuarioId,
      novaSenhaCriptografada,
      recuperacao.recuperacaoId,
    );
  }

  private normalizarCadastro(
    dados: CadastrarAlunoInput,
  ): Omit<CadastrarAlunoInput, "dataNascimento"> & {
    dataNascimento?: never;
  } {
    const isAlunoUnipe = dados.isAlunoUnipe === true;
    const nome = this.normalizarTextoObrigatorio(dados.nome, "Nome");
    const treinamento = this.normalizarTextoObrigatorio(
      dados.treinamento,
      "Treinamento",
    );
    const cpf = this.somenteDigitos(dados.cpf);
    const telefone = this.somenteDigitos(dados.telefone);
    const email = this.normalizarTextoObrigatorio(dados.email, "E-mail")
      .toLowerCase();
    const senha = dados.senha ?? "";

    if (!cpf) {
      throw new BadRequestError("CPF e obrigatorio.");
    }

    if (!telefone) {
      throw new BadRequestError("Telefone e obrigatorio.");
    }

    const cursoUnipe = isAlunoUnipe
      ? this.normalizarTextoObrigatorio(dados.cursoUnipe, "Curso UNIPE")
      : undefined;
    const rgm = isAlunoUnipe ? this.normalizarRgm(dados.rgm) : undefined;

    return {
      nome,
      cpf,
      telefone,
      email,
      isAlunoUnipe,
      cursoUnipe,
      senha,
      treinamento,
      rgm,
    };
  }

  private normalizarTextoObrigatorio(
    valor: string | undefined,
    campo: string,
  ): string {
    const normalizado = valor?.trim();

    if (!normalizado) {
      throw new BadRequestError(`${campo} e obrigatorio.`);
    }

    return normalizado.replace(/\s+/g, " ");
  }

  private somenteDigitos(valor: string | undefined): string {
    return (valor ?? "").replace(/\D/g, "");
  }

  private normalizarRgm(valor: string | undefined): string {
    const rgm = this.somenteDigitos(valor);

    if (!/^\d{8}$/.test(rgm)) {
      throw new BadRequestError("RGM deve conter exatamente 8 digitos.");
    }

    return rgm;
  }

  private criarCpf(cpf: string): Cpf {
    try {
      return new Cpf(cpf);
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : "CPF invalido.",
      );
    }
  }

  private criarTelefone(telefone: string): Telefone {
    try {
      return new Telefone(telefone);
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : "Telefone invalido.",
      );
    }
  }

  private criarEmail(email: string): Email {
    try {
      return new Email(email);
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : "E-mail invalido.",
      );
    }
  }

  private normalizarDataNascimento(data: Date | string): Date {
    const dataNascimento = data instanceof Date ? data : new Date(data);

    if (isNaN(dataNascimento.getTime())) {
      throw new BadRequestError("A data de nascimento e invalida.");
    }

    const hojeIso = new Date().toISOString().slice(0, 10);
    const dataNascimentoIso = dataNascimento.toISOString().slice(0, 10);

    if (dataNascimentoIso >= hojeIso) {
      throw new BadRequestError(
        "A data de nascimento deve ser anterior a hoje.",
      );
    }

    return dataNascimento;
  }

  private async criptografarSenha(senha: string): Promise<string> {
    if (!senha || senha.length < 8) {
      throw new BadRequestError("A senha deve ter no mínimo 8 caracteres.");
    }

    if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      throw new BadRequestError(
        "A senha deve conter pelo menos uma letra e um numero.",
      );
    }

    return await bcrypt.hash(senha, SALT_ROUNDS);
  }
}
