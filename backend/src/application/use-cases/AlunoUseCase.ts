import bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { Aluno, AlunoProps } from "../../domain/entities/Aluno";
import { AlunoRepository } from "../../domain/repositories/AlunoRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";
import { EmailService } from "../../infrastructure/email/EmailService";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { UnauthorizedError } from "../../infrastructure/errors/UnauthorizedError";

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
  ) {}

  async login(identificador: string, senhaBruta: string): Promise<Aluno> {
    let idLimpo = identificador.trim().toLowerCase();

    if (!idLimpo.includes("@")) {
      idLimpo = idLimpo.replace(/\D/g, "");
    }

    const aluno = await this.alunoRepository.buscarPorEmailOuCpf(idLimpo);

    if (!aluno) {
      throw new UnauthorizedError("Credenciais invalidas.");
    }

    const senhaCorreta = await bcrypt.compare(senhaBruta, aluno.senha);

    if (!senhaCorreta) {
      throw new UnauthorizedError("Credenciais invalidas.");
    }

    return aluno;
  }

  async cadastrar(dados: CadastrarAlunoInput): Promise<Aluno> {
    const cpfVo = new Cpf(dados.cpf);
    const telefoneVo = new Telefone(dados.telefone);
    const emailVo = new Email(dados.email);
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

    const senhaCriptografada = await this.criptografarSenha(dados.senha);

    const novoAluno = new Aluno({
      ...dados,
      cpf: cpfVo,
      telefone: telefoneVo,
      email: emailVo,
      dataNascimento,
      senha: senhaCriptografada,
      rgm: dados.isAlunoUnipe ? dados.rgm : undefined,
      cursoUnipe: dados.isAlunoUnipe ? dados.cursoUnipe : undefined,
    });

    return await this.alunoRepository.cadastrar(novoAluno);
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

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const linkRedefinicao = `${frontendUrl}/redefinir-senha?token=${tokenDeRecuperacao}`;

    await this.emailService.enviar(
      usuario.email,
      "Recuperacao de Senha - ADM Para Todos",
      `<p>Recebemos uma solicitacao para redefinir sua senha.</p>
       <p><a href="${linkRedefinicao}">Clique aqui para criar uma nova senha</a></p>
       <p>Este link expira em ${RECUPERACAO_SENHA_MINUTOS} minutos. Se voce nao solicitou, ignore este e-mail.</p>`,
    );

    console.log(`E-mail de recuperacao enviado para: ${usuario.email}`);
  }

  async redefinirSenha(tokenBruto: string, novaSenha: string): Promise<void> {
    if (!tokenBruto || tokenBruto.trim() === "") {
      throw new BadRequestError("O token de redefinicao e obrigatorio.");
    }

    if (!novaSenha || novaSenha.length < 8) {
      throw new BadRequestError("A senha deve ter no minimo 8 caracteres.");
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
    if (!senha || senha.trim() === "") {
      throw new BadRequestError("A senha e obrigatoria.");
    }

    return await bcrypt.hash(senha, SALT_ROUNDS);
  }
}
