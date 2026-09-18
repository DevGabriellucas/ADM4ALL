import bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { Aluno, AlunoProps } from "../../domain/entities/Aluno";
import {
  AlunoDashboard,
  AlunoRepository,
  DadosPessoaisDoAluno,
  MaterialAluno,
  MaterialAlunoDownload,
  MaterialVisivelAluno,
} from "../../domain/repositories/AlunoRepository";
import type { CertificadoAlunoDetalhe } from "../../domain/repositories/CoordenadorRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";
import { getRequiredEnv } from "../../infrastructure/config/env";
import { EmailService } from "../../infrastructure/email/EmailService";
import {
  gerarEmailAtivacaoConta,
  gerarEmailRecuperacaoSenha,
} from "../../infrastructure/email/emailTemplates";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { UnauthorizedError } from "../../infrastructure/errors/UnauthorizedError";
import { gerarCertificadoPdf } from "../../infrastructure/pdf/CertificatePdfService";
import { validarSenhaForte } from "../utils/validarSenha";
import { ATIVACAO_DIAS, ActivationUseCase } from "./ActivationUseCase";

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

    // Antes de qualquer outra checagem: quem foi excluido pela coordenacao nao
    // volta pelo cadastro publico. O texto e o que o usuario pediu que
    // aparecesse na tela de cadastro.
    if (await this.alunoRepository.cpfBloqueado(cpfVo.value)) {
      throw new BadRequestError(
        "Você está bloqueado e não conseguirá criar uma conta!!! Entre em contato com a coordenação do curso.",
      );
    }

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
        gerarEmailAtivacaoConta({
          nome: aluno.nome,
          link: linkAtivacao,
          diasParaExpirar: ATIVACAO_DIAS,
          motivo: "cadastro-publico",
        }),
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

    // Chegar aqui sem linha significa que o registro de aluno do token nao
    // existe mais, e nao que falta matricula — a consulta devolve painel vazio
    // para quem ainda nao tem turma. Entao e sessao morta: 401 faz o frontend
    // limpar o cookie e voltar ao login, em vez de repetir uma tela de erro que
    // o usuario nao tem como resolver.
    if (!dashboard) {
      throw new UnauthorizedError(
        "Sua conta nao esta mais disponivel. Entre novamente.",
      );
    }

    return this.adicionarComunicados(dashboard);
  }

  private adicionarComunicados(dashboard: AlunoDashboard): AlunoDashboard {
    const comunicados: AlunoDashboard["comunicados"] = [];

    if (dashboard.cursoDeExtensao.qtdFaltas >= 3) {
      comunicados.push({
        titulo: "Reprovação por falta",
        mensagem: "Você pode concluir o curso, mas não receberá certificado.",
        tipo: "importante",
      });
    } else if (dashboard.cursoDeExtensao.qtdFaltas >= 2) {
      comunicados.push({
        titulo: "Atenção à frequência",
        mensagem: "Você já possui 2 faltas. A partir da 3ª falta, será reprovado.",
        tipo: "atencao",
      });
    }

    if (dashboard.cursoDeExtensao.certificadoLiberado) {
      comunicados.push({
        titulo: "Curso concluído",
        mensagem: "Seu certificado foi liberado para emissão.",
        tipo: "informacao",
      });
    }

    return { ...dashboard, comunicados };
  }

  async atualizarAvatar(alunoId: string, avatarUrl: string): Promise<void> {
    if (!alunoId) {
      throw new UnauthorizedError("Aluno autenticado nao encontrado.");
    }

    if (!avatarUrl || avatarUrl.trim() === "") {
      throw new BadRequestError("A foto enviada e invalida.");
    }

    await this.alunoRepository.atualizarAvatar(alunoId, avatarUrl);
  }

  async removerAvatar(alunoId: string): Promise<void> {
    if (!alunoId) {
      throw new UnauthorizedError("Aluno autenticado nao encontrado.");
    }

    await this.alunoRepository.atualizarAvatar(alunoId, null);
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
    // A autorizacao e o proprio certificado: a consulta abaixo so devolve linha
    // com status 'emitido', e a reavaliacao cancela o certificado sozinha se o
    // aluno for reprovado depois.
    //
    // A liberacao vinha do painel, que reflete a matricula ATUAL do aluno, e
    // nao a matricula do certificado. Quem concluiu uma turma e voltou a
    // estudar em outra era barrado com "reprovado por frequencia" no
    // certificado que ja tinha conquistado.
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

    // O PDF sai SEMPRE do banco, nunca do arquivo salvo.
    //
    // Ate 18/09 este metodo devolvia o PDF gravado em disco quando ele
    // existia, e so caia na geracao se o arquivo tivesse sumido. Como o PDF e
    // gravado uma unica vez, na emissao, ele congelava: curso renomeado,
    // cronograma corrigido e qualquer mudanca no proprio certificado nao
    // chegavam ao aluno. Foi assim que um certificado do curso "RH" continuou
    // baixando com o texto antigo, o que dizia "area de administracao".
    //
    // O painel da coordenacao ja fazia assim (rota
    // /coordenador/certificados/:tipo/:referenciaId/pdf), e as duas telas
    // discordavam sobre o mesmo certificado. Gerar custa ~23ms, menos do que
    // ler os 1,7 MB do arquivo, entao o cache nao pagava nem em desempenho.
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
      faltas: cert.faltas,
      frequencia: cert.frequencia,
    };

    const pdf = await gerarCertificadoPdf(detalhe);

    // Sem gravar em disco: o arquivo so era escrito aqui para ser lido no
    // download seguinte, e esse caminho de leitura saiu. Reescrever 1,7 MB a
    // cada download seria trabalho que ninguem le depois. A copia gravada na
    // emissao (CoordenadorUseCase) continua existindo como registro.
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

  /**
   * Os dados que o sistema guarda sobre o aluno, para ele mesmo baixar.
   *
   * Art. 18, II e V da LGPD. O `alunoId` vem do token, nunca da URL: sem isso a
   * rota viraria um jeito de baixar a ficha de qualquer aluno trocando um id.
   */
  async obterDadosPessoais(alunoId: string): Promise<DadosPessoaisDoAluno> {
    const dados =
      await this.alunoRepository.buscarDadosPessoaisDoAluno(alunoId);

    if (!dados) {
      throw new BadRequestError("Aluno nao encontrado.");
    }

    return dados;
  }

  async redefinirSenha(tokenBruto: string, novaSenha: string): Promise<void> {
    if (!tokenBruto || tokenBruto.trim() === "") {
      throw new BadRequestError("O token de redefinicao e obrigatorio.");
    }

    // As mesmas regras do cadastro. A tela ja as cobra na barrinha de forca,
    // mas ate 18/09 a API so exigia 8 caracteres e aceitava "12345678".
    validarSenhaForte(novaSenha);

    const tokenHash = createHash("sha256")
      .update(tokenBruto.trim())
      .digest("hex");

    const recuperacao =
      await this.alunoRepository.buscarRecuperacaoValidaPorTokenHash(tokenHash);

    if (!recuperacao) {
      throw new BadRequestError("Link de redefinicao invalido ou expirado.");
    }

    // Recuperar a senha tem que trocar a senha. Digitar a atual passava batido
    // e o aluno saia da tela com "Senha redefinida com sucesso" sem ter
    // mudado nada — e o link de recuperacao, que e de uso unico, ja tinha
    // sido queimado. A conferencia mora no servidor porque a tela nao conhece
    // (nem pode conhecer) a senha em uso.
    const senhaHashAtual = recuperacao.senhaHashAtual;
    const repetiuSenhaAtual =
      senhaHashAtual !== null && (await bcrypt.compare(novaSenha, senhaHashAtual));

    if (repetiuSenhaAtual) {
      throw new BadRequestError(
        "A nova senha precisa ser diferente da senha atual.",
      );
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
    validarSenhaForte(senha);

    return await bcrypt.hash(senha, SALT_ROUNDS);
  }
}
