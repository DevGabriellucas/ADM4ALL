import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import {
  CampoPendenteAtivacao,
} from "../../domain/repositories/ActivationRepository";
import {
  ConviteCriado,
  CoordenadorRepository,
  CursoResumo,
  DashboardResumo,
  InstrutorListagem,
  TurmaDetalhe,
  TurmaListagem,
} from "../../domain/repositories/CoordenadorRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";
import { EmailService } from "../../infrastructure/email/EmailService";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { ActivationUseCase } from "./ActivationUseCase";

export interface CriarCursoEntrada {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  status?: string;
}

export interface ConvidarInstrutorEntrada {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
}

export interface ConvidarAlunoEntrada {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
  dataNascimento: string;
  curso: string;
  turma: string;
}

export interface CriarTurmaEntrada {
  curso: string;
  nome: string;
  instrutor: string;
  dataInicio: string;
  dataTermino: string;
  horario: string;
  limiteAlunos: number;
  status?: string;
  coordenadorId?: string | null;
}

const CURSO_STATUS_VALIDOS = ["ativo", "em_planejamento", "encerrado"];
const TURMA_STATUS_VALIDOS = [
  "planejada",
  "em_andamento",
  "encerrada",
  "cancelada",
];
const SALT_ROUNDS = 10;

export class CoordenadorUseCase {
  constructor(
    private coordenadorRepository: CoordenadorRepository,
    private emailService: EmailService,
    private activationUseCase: ActivationUseCase,
  ) {}

  async obterDashboard(): Promise<DashboardResumo> {
    return await this.coordenadorRepository.buscarDashboard();
  }

  async listarCursos(): Promise<CursoResumo[]> {
    return await this.coordenadorRepository.listarCursos();
  }

  async criarCurso(input: CriarCursoEntrada): Promise<CursoResumo> {
    if (!input.nome || input.nome.trim() === "") {
      throw new BadRequestError("O nome do curso e obrigatorio.");
    }

    if (!input.descricao || input.descricao.trim() === "") {
      throw new BadRequestError("A descricao do curso e obrigatoria.");
    }

    if (!input.cargaHoraria || input.cargaHoraria <= 0) {
      throw new BadRequestError("A carga horaria deve ser maior que zero.");
    }

    const status = input.status ?? "em_planejamento";
    if (!CURSO_STATUS_VALIDOS.includes(status)) {
      throw new BadRequestError(
        `Status de curso invalido. Use: ${CURSO_STATUS_VALIDOS.join(", ")}.`,
      );
    }

    try {
      return await this.coordenadorRepository.criarCurso({
        nome: input.nome.trim(),
        descricao: input.descricao.trim(),
        cargaHoraria: input.cargaHoraria,
        status,
      });
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async listarInstrutores(): Promise<InstrutorListagem[]> {
    return await this.coordenadorRepository.listarInstrutores();
  }

  async convidarInstrutor(
    input: ConvidarInstrutorEntrada,
  ): Promise<ConviteCriado> {
    if (!input.nome || input.nome.trim() === "") {
      throw new BadRequestError("O nome do instrutor e obrigatorio.");
    }

    if (!input.email || !input.email.includes("@")) {
      throw new BadRequestError("Informe um e-mail valido.");
    }

    const emailNormalizado = input.email.trim().toLowerCase();
    let cpfNormalizado: string;

    try {
      cpfNormalizado = new Cpf(input.cpf).value;
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : "Informe um CPF valido.",
      );
    }

    const usuarioExistente =
      await this.coordenadorRepository.buscarUsuarioPorEmail(emailNormalizado);

    if (usuarioExistente) {
      throw new BadRequestError("Ja existe um usuario com este e-mail.");
    }

    const usuarioComCpf =
      await this.coordenadorRepository.buscarUsuarioPorCpf(cpfNormalizado);

    if (usuarioComCpf) {
      throw new BadRequestError("Ja existe um usuario com este CPF.");
    }

    const senhaTemporaria = randomBytes(32).toString("hex");
    const senhaTemporariaCriptografada = await bcrypt.hash(
      senhaTemporaria,
      SALT_ROUNDS,
    );

    const convite = await this.coordenadorRepository.convidarInstrutor({
      nome: input.nome.trim(),
      email: emailNormalizado,
      cpf: cpfNormalizado,
      telefone: input.telefone ?? null,
      senhaTemporariaCriptografada,
    });
    const camposPendentes: CampoPendenteAtivacao[] = ["senha"];
    if (!input.telefone) {
      camposPendentes.push("whatsapp");
    }
    camposPendentes.push("areaAtuacao", "formacao");
    const tokenAtivacao = await this.activationUseCase.criar(
      convite.usuarioId,
      "criado_por_coordenador",
      camposPendentes,
    );

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const linkAtivacao = `${frontendUrl}/ativar-conta?token=${tokenAtivacao}`;

    try {
      await this.emailService.enviar(
        convite.email,
        "Convite para acessar o ADM Para Todos",
        `<p>Ola, ${convite.nome}!</p>
         <p>Voce foi cadastrado como instrutor no ADM Para Todos.</p>
         <p><a href="${linkAtivacao}">Clique aqui para definir sua senha e ativar sua conta</a></p>
         <p>Este link expira em 3 dias.</p>`,
      );
    } catch (error) {
      // A conta ja foi criada no banco; o e-mail e um efeito colateral best-effort.
      // Uma falha de envio nao deve desfazer o convite ja persistido.
      console.error("Falha ao enviar e-mail de convite:", error);
    }

    return convite;
  }

  async convidarAluno(input: ConvidarAlunoEntrada): Promise<ConviteCriado> {
    if (!input.nome?.trim()) {
      throw new BadRequestError("O nome do aluno e obrigatorio.");
    }

    let email: string;
    let cpf: string;
    let telefone: string | null;
    try {
      email = new Email(input.email).value;
      cpf = new Cpf(input.cpf).value;
      telefone = input.telefone ? new Telefone(input.telefone).value : null;
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : "Dados pessoais invalidos.",
      );
    }

    const dataNascimento = new Date(input.dataNascimento);
    if (
      Number.isNaN(dataNascimento.getTime()) ||
      dataNascimento.toISOString().slice(0, 10) >=
        new Date().toISOString().slice(0, 10)
    ) {
      throw new BadRequestError("Informe uma data de nascimento valida.");
    }
    if (!input.curso?.trim() || !input.turma?.trim()) {
      throw new BadRequestError("Informe o curso e a turma.");
    }

    const convite = await this.coordenadorRepository.convidarAluno({
      nome: input.nome.trim(),
      email,
      cpf,
      telefone,
      dataNascimento: input.dataNascimento,
      treinamento: input.curso.trim(),
      turma: input.turma.trim(),
      senhaTemporariaCriptografada: await bcrypt.hash(
        randomBytes(32).toString("hex"),
        SALT_ROUNDS,
      ),
    });
    const camposPendentes: CampoPendenteAtivacao[] = ["senha"];
    if (!telefone) camposPendentes.push("whatsapp");
    camposPendentes.push("rgm", "cursoUnipe");
    const token = await this.activationUseCase.criar(
      convite.usuarioId,
      "criado_por_coordenador",
      camposPendentes,
    );
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const linkAtivacao = `${frontendUrl}/ativar-conta?token=${token}`;

    try {
      await this.emailService.enviar(
        convite.email,
        "Convite para acessar o ADM Para Todos",
        `<p>Ola, ${convite.nome}!</p>
         <p>Voce foi cadastrado como aluno no ADM Para Todos.</p>
         <p><a href="${linkAtivacao}">Complete seu cadastro e ative sua conta</a></p>
         <p>Este link expira em 3 dias.</p>`,
      );
    } catch (error) {
      console.error("Falha ao enviar e-mail de convite:", error);
    }

    return convite;
  }

  async listarTurmas(): Promise<TurmaListagem[]> {
    return await this.coordenadorRepository.listarTurmas();
  }

  async buscarTurmaDetalhe(id: string): Promise<TurmaDetalhe> {
    if (!id) {
      throw new BadRequestError("O ID da turma e obrigatorio.");
    }

    const turma = await this.coordenadorRepository.buscarTurmaDetalhe(id);
    if (!turma) {
      throw new BadRequestError("Turma nao encontrada.");
    }

    return turma;
  }

  async criarTurma(input: CriarTurmaEntrada): Promise<TurmaListagem> {
    if (!input.curso || input.curso.trim() === "") {
      throw new BadRequestError("O curso e obrigatorio.");
    }

    if (!input.nome || input.nome.trim() === "") {
      throw new BadRequestError("O nome da turma e obrigatorio.");
    }

    if (!input.instrutor || input.instrutor.trim() === "") {
      throw new BadRequestError("O instrutor responsavel e obrigatorio.");
    }

    if (!input.dataInicio || !input.dataTermino) {
      throw new BadRequestError("Informe data de inicio e de termino.");
    }

    if (input.dataTermino < input.dataInicio) {
      throw new BadRequestError(
        "A data de termino deve ser igual ou posterior a data de inicio.",
      );
    }

    if (!input.horario || input.horario.trim() === "") {
      throw new BadRequestError("Informe os dias e horarios das aulas.");
    }

    if (!input.limiteAlunos || input.limiteAlunos <= 0) {
      throw new BadRequestError("O limite de alunos deve ser maior que zero.");
    }

    const statusFrontend = input.status ?? "planejada";
    if (!TURMA_STATUS_VALIDOS.includes(statusFrontend)) {
      throw new BadRequestError(
        `Status de turma invalido. Use: ${TURMA_STATUS_VALIDOS.join(", ")}.`,
      );
    }

    const treinamento = await this.coordenadorRepository.buscarTreinamentoPorNome(
      input.curso.trim(),
    );
    if (!treinamento) {
      throw new BadRequestError("Curso nao encontrado.");
    }

    const instrutor = await this.coordenadorRepository.buscarInstrutorAtivoPorNome(
      input.instrutor.trim(),
    );
    if (!instrutor) {
      throw new BadRequestError("Instrutor nao encontrado ou inativo.");
    }

    const statusBanco = statusFrontend === "encerrada" ? "concluida" : statusFrontend;

    try {
      return await this.coordenadorRepository.criarTurma({
        treinamentoId: treinamento.id,
        instrutorId: instrutor.id,
        coordenadorId: input.coordenadorId ?? null,
        nome: input.nome.trim(),
        dataInicio: input.dataInicio,
        dataTermino: input.dataTermino,
        horario: input.horario.trim(),
        limiteAlunos: input.limiteAlunos,
        status: statusBanco,
      });
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

}
