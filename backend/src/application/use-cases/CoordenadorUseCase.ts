import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  CampoPendenteAtivacao,
} from "../../domain/repositories/ActivationRepository";
import { ConfiguracoesRepository } from "../../domain/repositories/ConfiguracoesRepository";
import {
  buildRelatorioPath,
  buildRelatorioRelativePath,
  ensureRelatoriosDir,
  removeRelatorioFile,
} from "../../infrastructure/storage/relatoriosStorage";
import {
  AlunoDetalheCoordenador,
  AlunoListagemCoordenador,
  AlunoParaReenvioAtivacao,
  AtualizarInstrutorCoordenadorInput,
  AtualizarStatusMatriculaInput,
  AtualizarAlunoCoordenadorInput,
  AtualizarUsuarioInput,
  CertificadoDetalhe,
  CertificadoListagemCoordenador,
  CoordinatorReportType,
  ConviteCriado,
  CoordenadorRepository,
  CursoResumo,
  DashboardResumo,
  FiltrosFrequenciaCoordenador,
  FiltrosRelatorioCoordenador,
  FrequenciaCoordenador,
  InstrutorDetalheCoordenador,
  InstrutorParaReenvioAtivacao,
  InstrutorListagem,
  MatriculaCriada,
  MatriculaStatusAtualizado,
  PerfilCoordenador,
  PeriodoLetivoResponse,
  RelatorioCoordenador,
  RelatorioGerado,
  StatusMatriculaEditavel,
  TipoCertificado,
  TurmaDetalhe,
  TurmaListagem,
  UsuarioListagemCoordenador,
} from "../../domain/repositories/CoordenadorRepository";
import { Cpf } from "../../domain/value-objects/Cpf";
import { Email } from "../../domain/value-objects/Email";
import { Telefone } from "../../domain/value-objects/Telefone";
import { getRequiredEnv } from "../../infrastructure/config/env";
import { getCertificadosStorageDir } from "../../infrastructure/config/storage";
import { EmailService } from "../../infrastructure/email/EmailService";
import { AppError } from "../../infrastructure/errors/AppError";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { NotFoundError } from "../../infrastructure/errors/NotFoundError";
import { gerarCertificadoPdf } from "../../infrastructure/pdf/CertificatePdfService";
import {
  gerarRelatorioCsv,
  gerarRelatorioPdf,
} from "../../infrastructure/reports/CoordinatorReportExportService";
import {
  MENSAGEM_PERIODO_INVALIDO,
  PERIODO_REGEX,
} from "../../application/utils/calcularPeriodoLetivo";
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

export interface ConvidarCoordenadorEntrada {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
  areaCoordenacao?: string | null;
}

export interface AtualizarInstrutorEntrada {
  nome: string;
  email: string;
  telefone?: string | null;
  areaAtuacao?: string | null;
  formacao?: string | null;
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
  instrutores: string[];
  periodoLetivo: string;
  horario: string;
  limiteAlunos: number;
  status?: string;
  coordenadorId?: string | null;
}

export interface AtualizarAlunoEntrada {
  nome: string;
  email: string;
  telefone?: string | null;
  statusConta: AlunoDetalheCoordenador["statusConta"];
}

export interface FiltrosFrequenciaEntrada {
  curso?: string;
  turma?: string;
  aluno?: string;
  periodo?: string;
}

const CURSO_STATUS_VALIDOS = ["ativo", "em_planejamento", "desativado"];
const TURMA_STATUS_VALIDOS = [
  "planejada",
  "em_andamento",
  "concluida",
  "encerrada",
  "cancelada",
];
const SALT_ROUNDS = 10;

function derivarDatasDoPeriodo(periodoLetivo: string): { dataInicio: string; dataFim: string } {
  const ano = periodoLetivo.substring(0, 4);
  const semestre = periodoLetivo.charAt(5);

  if (semestre === "1") {
    return { dataInicio: `${ano}-02-03`, dataFim: `${ano}-06-30` };
  }

  return { dataInicio: `${ano}-08-01`, dataFim: `${ano}-12-15` };
}

const STATUS_CONTA_VALIDOS = [
  "ativo",
  "inativo",
  "bloqueado",
  "pendente_ativacao",
] as const;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUS_MATRICULA_EDITAVEIS: readonly StatusMatriculaEditavel[] = [
  "em_andamento",
  "aprovado",
  "reprovado_falta",
];
const TIPOS_RELATORIO: readonly CoordinatorReportType[] = [
  "frequencia_turma",
  "reprovados_falta",
  "elegiveis_certificado",
  "certificados_emitidos",
  "matriculas_curso",
  "turmas_andamento",
];
const DATA_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isStatusMatriculaEditavel = (
  status: string,
): status is StatusMatriculaEditavel =>
  STATUS_MATRICULA_EDITAVEIS.includes(status as StatusMatriculaEditavel);

const isTipoCertificado = (tipo: string): tipo is TipoCertificado =>
  tipo === "aluno";

const isTipoRelatorio = (tipo: string): tipo is CoordinatorReportType =>
  TIPOS_RELATORIO.includes(tipo as CoordinatorReportType);

const calcularMetricaRelatorio = (
  relatorio: RelatorioCoordenador,
): number => {
  if (relatorio.type === "frequencia_turma") {
    // Media das frequencias das turmas, a mesma conta que a coluna da tabela
    // mostra. Turma sem chamada nao entra: ela nao tem frequencia, e nao 0%.
    const turmasComChamada = relatorio.rows.filter(
      (row) => (row.metricDenominator ?? 0) > 0,
    );

    if (turmasComChamada.length === 0) {
      return 0;
    }

    const soma = turmasComChamada.reduce(
      (total, row) => total + row.chartValue,
      0,
    );

    return Math.round(soma / turmasComChamada.length);
  }

  if (relatorio.aggregation === "count") return relatorio.rows.length;

  const total = relatorio.rows.reduce(
    (sum, row) => sum + row.chartValue,
    0,
  );
  return relatorio.aggregation === "average" && relatorio.rows.length > 0
    ? Math.round(total / relatorio.rows.length)
    : total;
};

const gerarCodigoCertificado = () =>
  `CERT-ALU-${new Date().getFullYear()}-${randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

const formatarTimestampArquivo = (data = new Date()): string => {
  const partes = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  })
    .format(data)
    .replace(" ", "-")
    .replace(/:/g, "");

  return partes;
};

const montarNomeArquivoRelatorio = (
  tipo: CoordinatorReportType,
  extensao: "csv" | "pdf",
): string =>
  `relatorio-${tipo}-${formatarTimestampArquivo()}-${randomBytes(3).toString(
    "hex",
  )}.${extensao}`;

export class CoordenadorUseCase {
  constructor(
    private coordenadorRepository: CoordenadorRepository,
    private emailService: EmailService,
    private activationUseCase: ActivationUseCase,
    private configuracoeRepository: ConfiguracoesRepository,
  ) {}

  async obterDashboard(): Promise<DashboardResumo> {
    return await this.coordenadorRepository.buscarDashboard();
  }

  async listarCursos(): Promise<CursoResumo[]> {
    return await this.coordenadorRepository.listarCursos();
  }

  async listarTurmasPorCurso(cursoId: string): Promise<TurmaListagem[]> {
    if (!UUID_PATTERN.test(cursoId)) {
      throw new BadRequestError("O ID do curso e invalido.");
    }

    return await this.coordenadorRepository.listarTurmasPorCurso(cursoId);
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

  async buscarCursoPorId(id: string): Promise<CursoResumo> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do curso e invalido.");
    }

    const curso = await this.coordenadorRepository.buscarCursoPorId(id);
    if (!curso) {
      throw new BadRequestError("Curso nao encontrado.");
    }

    return curso;
  }

  async atualizarCurso(id: string, input: CriarCursoEntrada): Promise<CursoResumo> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do curso e invalido.");
    }

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

    const existente = await this.coordenadorRepository.buscarCursoPorId(id);
    if (!existente) {
      throw new BadRequestError("Curso nao encontrado.");
    }

    try {
      const curso = await this.coordenadorRepository.atualizarCurso(id, {
        nome: input.nome.trim(),
        descricao: input.descricao.trim(),
        cargaHoraria: input.cargaHoraria,
        status,
      });

      if (!curso) {
        throw new BadRequestError("Curso nao encontrado.");
      }

      return curso;
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async listarInstrutores(): Promise<InstrutorListagem[]> {
    return await this.coordenadorRepository.listarInstrutores();
  }

  async buscarInstrutorDetalhe(
    id: string,
  ): Promise<InstrutorDetalheCoordenador> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do instrutor e invalido.");
    }

    const instrutor =
      await this.coordenadorRepository.buscarInstrutorDetalhe(id);
    if (!instrutor) {
      throw new BadRequestError("Instrutor nao encontrado.");
    }

    return instrutor;
  }

  async atualizarInstrutor(
    id: string,
    input: AtualizarInstrutorEntrada,
  ): Promise<InstrutorDetalheCoordenador> {
    const instrutorAtual = await this.buscarInstrutorDetalhe(id);

    if (!input.nome?.trim()) {
      throw new BadRequestError("O nome do instrutor e obrigatorio.");
    }

    let email: string;
    let telefone: string | null;
    try {
      email = new Email(input.email).value;
      telefone = input.telefone ? new Telefone(input.telefone).value : null;
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : "Dados pessoais invalidos.",
      );
    }

    const usuarioComEmail =
      await this.coordenadorRepository.buscarUsuarioPorEmail(email);
    if (usuarioComEmail && usuarioComEmail.id !== instrutorAtual.usuarioId) {
      throw new BadRequestError("Ja existe um usuario com este e-mail.");
    }

    const dadosAtualizados: AtualizarInstrutorCoordenadorInput = {
      nome: input.nome.trim(),
      email,
      telefone,
      areaAtuacao: input.areaAtuacao?.trim() || null,
      formacao: input.formacao?.trim() || null,
    };
    const instrutor = await this.coordenadorRepository.atualizarInstrutor(
      id,
      dadosAtualizados,
    );

    if (!instrutor) {
      throw new BadRequestError("Instrutor nao encontrado.");
    }

    return instrutor;
  }

  async atualizarStatusInstrutor(
    id: string,
    statusConta: string,
  ): Promise<InstrutorDetalheCoordenador> {
    const instrutorAtual = await this.buscarInstrutorDetalhe(id);

    if (!STATUS_CONTA_VALIDOS.includes(statusConta as any)) {
      throw new BadRequestError("Status da conta invalido.");
    }

    if (
      instrutorAtual.status === "pendente_ativacao" &&
      statusConta !== "inativo"
    ) {
      throw new BadRequestError(
        "Convites pendentes so podem ser desativados ou reenviados.",
      );
    }

    const instrutor =
      await this.coordenadorRepository.atualizarStatusInstrutor(
        id,
        statusConta as InstrutorDetalheCoordenador["status"],
      );

    if (!instrutor) {
      throw new BadRequestError("Instrutor nao encontrado.");
    }

    return instrutor;
  }

  async reenviarAtivacaoInstrutor(instrutorId: string): Promise<void> {
    if (!UUID_PATTERN.test(instrutorId)) {
      throw new BadRequestError("O ID do instrutor e invalido.");
    }

    const instrutor: InstrutorParaReenvioAtivacao | null =
      await this.coordenadorRepository.buscarUsuarioPorInstrutorId(instrutorId);
    if (!instrutor) {
      throw new BadRequestError("Instrutor nao encontrado.");
    }
    if (instrutor.status !== "pendente_ativacao") {
      throw new BadRequestError(
        "A conta do instrutor nao esta pendente de ativacao.",
      );
    }

    await this.coordenadorRepository.invalidarAtivacoesPendentes(
      instrutor.usuarioId,
    );
    const token = await this.activationUseCase.criar(
      instrutor.usuarioId,
      instrutor.origem ?? "criado_por_coordenador",
      instrutor.camposPendentes.length > 0
        ? instrutor.camposPendentes
        : ["senha", "whatsapp", "areaAtuacao", "formacao"],
    );
    const frontendUrl = getRequiredEnv("FRONTEND_URL");
    const linkAtivacao = `${frontendUrl}/ativar-conta?token=${token}`;

    try {
      await this.emailService.enviar(
        instrutor.email,
        "Novo link de ativacao - ADM Para Todos",
        `<p>Ola, ${instrutor.nome}!</p>
         <p>Foi solicitado um novo link para ativar sua conta de instrutor.</p>
         <p><a href="${linkAtivacao}">Ativar minha conta</a></p>
         <p>Este link expira em 3 dias.</p>`,
      );
    } catch {
      await this.coordenadorRepository.invalidarAtivacoesPendentes(
        instrutor.usuarioId,
      );
      throw new BadRequestError(
        "Nao foi possivel enviar o e-mail de ativacao. Tente novamente em instantes.",
      );
    }
  }

  async atualizarStatusUsuario(
    id: string,
    status: string,
    usuarioLogadoId?: string,
    perfilLogado?: string,
  ): Promise<UsuarioListagemCoordenador> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do usuario e invalido.");
    }

    if (status !== "ativo" && status !== "inativo") {
      throw new BadRequestError(
        "Status invalido. Use apenas 'ativo' ou 'inativo'.",
      );
    }

    const usuario = await this.coordenadorRepository.buscarUsuarioPorId(id);
    if (!usuario) {
      throw new NotFoundError("Usuario nao encontrado.");
    }

    if (usuarioLogadoId && usuarioLogadoId === id && status === "inativo") {
      throw new BadRequestError(
        "Voce nao pode desativar a propria conta.",
      );
    }

    if (status === "inativo") {
      // Separacao de privilegio: antes existia apenas a trava da propria conta,
      // entao qualquer coordenador podia desativar o administrador do sistema
      // ou outro coordenador.
      if (
        perfilLogado === "coordenador" &&
        (usuario.role === "administrador" || usuario.role === "coordenador")
      ) {
        throw new AppError(
          "Apenas um administrador pode desativar contas de coordenacao ou administracao.",
          403,
        );
      }

      // Trava de seguranca contra lockout: sem admin ativo ninguem consegue
      // reativar a conta pela interface — so por SQL no banco.
      if (usuario.role === "administrador") {
        const administradoresAtivos =
          await this.coordenadorRepository.contarAdministradoresAtivos();

        if (administradoresAtivos <= 1) {
          throw new BadRequestError(
            "Este e o unico administrador ativo. Promova outro administrador antes de desativar esta conta.",
          );
        }
      }
    }

    const atualizado =
      await this.coordenadorRepository.atualizarStatusUsuario(
        id,
        status as "ativo" | "inativo",
      );

    if (!atualizado) {
      throw new NotFoundError("Usuario nao encontrado.");
    }

    return atualizado;
  }

  // As mesmas travas que existiam no desativar valem aqui, e com mais razao:
  // desativar era reversivel pela interface, excluir nao e.
  async excluirUsuario(
    id: string,
    usuarioLogadoId?: string,
    perfilLogado?: string,
  ): Promise<void> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do usuario e invalido.");
    }

    const usuario = await this.coordenadorRepository.buscarUsuarioPorId(id);
    if (!usuario) {
      throw new NotFoundError("Usuario nao encontrado.");
    }

    if (usuarioLogadoId && usuarioLogadoId === id) {
      throw new BadRequestError("Voce nao pode excluir a propria conta.");
    }

    if (
      perfilLogado === "coordenador" &&
      (usuario.role === "administrador" || usuario.role === "coordenador")
    ) {
      throw new AppError(
        "Apenas um administrador pode excluir contas de coordenacao ou administracao.",
        403,
      );
    }

    // Trava contra lockout: sem admin ativo ninguem reativa nada pela
    // interface, e com a exclusao nem por reativacao — so por SQL no banco.
    if (usuario.role === "administrador") {
      const administradoresAtivos =
        await this.coordenadorRepository.contarAdministradoresAtivos();

      if (administradoresAtivos <= 1) {
        throw new BadRequestError(
          "Este e o unico administrador ativo. Promova outro administrador antes de excluir esta conta.",
        );
      }
    }

    const excluido = await this.coordenadorRepository.excluirUsuario(
      id,
      usuarioLogadoId ?? null,
    );

    if (!excluido) {
      throw new NotFoundError("Usuario nao encontrado.");
    }
  }

  async excluirCurso(id: string): Promise<void> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do curso e invalido.");
    }

    const excluido = await this.coordenadorRepository.excluirCurso(id);

    if (!excluido) {
      throw new NotFoundError("Curso nao encontrado.");
    }
  }

  async excluirInstrutor(id: string): Promise<void> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do instrutor e invalido.");
    }

    const excluido = await this.coordenadorRepository.excluirInstrutor(id);

    if (!excluido) {
      throw new NotFoundError("Instrutor nao encontrado.");
    }
  }

  // Excluir o aluno apaga o usuario e, em cascata, matricula, frequencia e
  // certificado. A pessoa pode se cadastrar novamente no futuro.
  async excluirAluno(id: string, excluidoPorId?: string): Promise<void> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do aluno e invalido.");
    }

    const excluido = await this.coordenadorRepository.excluirAluno(
      id,
      excluidoPorId ?? null,
    );

    if (!excluido) {
      throw new NotFoundError("Aluno nao encontrado.");
    }
  }

  async listarAlunos(): Promise<AlunoListagemCoordenador[]> {
    return await this.coordenadorRepository.listarAlunos();
  }

  async listarUsuarios(): Promise<UsuarioListagemCoordenador[]> {
    return await this.coordenadorRepository.listarUsuarios();
  }

  async atualizarUsuario(
    id: string,
    input: AtualizarUsuarioInput,
  ): Promise<UsuarioListagemCoordenador> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do usuario e invalido.");
    }

    if (!input.nome?.trim()) {
      throw new BadRequestError("O nome do usuario e obrigatorio.");
    }

    let email: string;
    let cpf: string;
    try {
      email = new Email(input.email).value;
      cpf = new Cpf(input.cpf).value;
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : "Dados do usuario invalidos.",
      );
    }

    const usuarioComEmail =
      await this.coordenadorRepository.buscarUsuarioPorEmail(email);
    if (usuarioComEmail && usuarioComEmail.id !== id) {
      throw new BadRequestError("Ja existe um usuario com este e-mail.");
    }

    const usuarioComCpf =
      await this.coordenadorRepository.buscarUsuarioPorCpf(cpf);
    if (usuarioComCpf && usuarioComCpf.id !== id) {
      throw new BadRequestError("Ja existe um usuario com este CPF.");
    }

    try {
      const usuario = await this.coordenadorRepository.atualizarUsuario(id, {
        nome: input.nome.trim(),
        email,
        cpf,
      });

      if (!usuario) {
        throw new NotFoundError("Usuario nao encontrado.");
      }

      return usuario;
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(error.message);
    }
  }

  async buscarAlunoDetalhe(id: string): Promise<AlunoDetalheCoordenador> {
    if (!id) {
      throw new BadRequestError("O ID do aluno e obrigatorio.");
    }

    const aluno = await this.coordenadorRepository.buscarAlunoDetalhe(id);
    if (!aluno) {
      throw new BadRequestError("Aluno nao encontrado.");
    }

    return aluno;
  }

  async atualizarAluno(
    id: string,
    input: AtualizarAlunoEntrada,
    atualizadoPorId?: string,
  ): Promise<AlunoDetalheCoordenador> {
    const alunoAtual = await this.buscarAlunoDetalhe(id);

    if (!input.nome?.trim()) {
      throw new BadRequestError("O nome do aluno e obrigatorio.");
    }

    let email: string;
    let telefone: string | null;
    try {
      email = new Email(input.email).value;
      telefone = input.telefone ? new Telefone(input.telefone).value : null;
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error ? error.message : "Dados pessoais invalidos.",
      );
    }

    if (!STATUS_CONTA_VALIDOS.includes(input.statusConta)) {
      throw new BadRequestError("Status da conta invalido.");
    }

    const usuarioComEmail =
      await this.coordenadorRepository.buscarUsuarioPorEmail(email);
    if (usuarioComEmail && usuarioComEmail.id !== alunoAtual.usuarioId) {
      throw new BadRequestError("Ja existe um usuario com este e-mail.");
    }

    const dadosAtualizados: AtualizarAlunoCoordenadorInput = {
      nome: input.nome.trim(),
      email,
      telefone,
      statusConta: input.statusConta,
    };
    const aluno = await this.coordenadorRepository.atualizarAluno(
      id,
      dadosAtualizados,
    );

    if (!aluno) {
      throw new BadRequestError("Aluno nao encontrado.");
    }

    // Bloquear a conta tem que bloquear o CPF tambem: so tirar o login deixava
    // a pessoa se cadastrar de novo com outro e-mail. Reativar desfaz.
    if (input.statusConta === "bloqueado" || input.statusConta === "ativo") {
      await this.coordenadorRepository.sincronizarBloqueioCpfDoAluno(
        id,
        input.statusConta === "bloqueado",
        atualizadoPorId ?? null,
      );
    }

    return aluno;
  }

  async reenviarAtivacao(alunoId: string): Promise<void> {
    if (!UUID_PATTERN.test(alunoId)) {
      throw new BadRequestError("O ID do aluno e invalido.");
    }

    const aluno: AlunoParaReenvioAtivacao | null =
      await this.coordenadorRepository.buscarUsuarioPorAlunoId(alunoId);
    if (!aluno) {
      throw new BadRequestError("Aluno nao encontrado.");
    }
    if (aluno.status !== "pendente_ativacao") {
      throw new BadRequestError("A conta do aluno nao esta pendente de ativacao.");
    }
    if (!aluno.origem) {
      throw new BadRequestError(
        "Nao foi possivel identificar o convite de ativacao do aluno.",
      );
    }

    await this.coordenadorRepository.invalidarAtivacoesPendentes(
      aluno.usuarioId,
    );
    const token = await this.activationUseCase.criar(
      aluno.usuarioId,
      aluno.origem,
      aluno.camposPendentes,
    );
    const frontendUrl = getRequiredEnv("FRONTEND_URL");
    const linkAtivacao = `${frontendUrl}/ativar-conta?token=${token}`;

    try {
      await this.emailService.enviar(
        aluno.email,
        "Novo link de ativacao - ADM Para Todos",
        `<p>Ola, ${aluno.nome}!</p>
         <p>Foi solicitado um novo link para ativar sua conta.</p>
         <p><a href="${linkAtivacao}">Ativar minha conta</a></p>
         <p>Este link expira em 3 dias.</p>`,
      );
    } catch {
      await this.coordenadorRepository.invalidarAtivacoesPendentes(
        aluno.usuarioId,
      );
      throw new BadRequestError(
        "Nao foi possivel enviar o e-mail de ativacao. Tente novamente em instantes.",
      );
    }
  }

  async vincularAlunoTurma(
    turmaId: string,
    alunoId: string,
  ): Promise<MatriculaCriada> {
    if (!UUID_PATTERN.test(turmaId)) {
      throw new BadRequestError("O ID da turma e invalido.");
    }
    if (!UUID_PATTERN.test(alunoId)) {
      throw new BadRequestError("O ID do aluno e invalido.");
    }

    const turma = await this.coordenadorRepository.buscarTurmaPorId(turmaId);
    if (!turma) {
      throw new BadRequestError("Turma nao encontrada.");
    }
    if (turma.status === "encerrada" || turma.status === "concluida" || turma.status === "cancelada") {
      throw new BadRequestError(
        "Nao e possivel matricular alunos em uma turma finalizada ou cancelada.",
      );
    }

    const alunoExiste =
      await this.coordenadorRepository.verificarAlunoExiste(alunoId);
    if (!alunoExiste) {
      throw new BadRequestError("Aluno nao encontrado.");
    }

    const matriculaNaTurma =
      await this.coordenadorRepository.buscarMatriculaAlunoTurma(
        alunoId,
        turmaId,
      );
    if (matriculaNaTurma && matriculaNaTurma.status !== "cancelado") {
      throw new BadRequestError("O aluno ja possui matricula nesta turma.");
    }

    const matriculaAtiva =
      await this.coordenadorRepository.buscarMatriculaAtivaNoTreinamento(
        alunoId,
        turma.treinamentoId,
      );
    if (matriculaAtiva && matriculaAtiva.id !== matriculaNaTurma?.id) {
      throw new BadRequestError(
        "O aluno ja possui matricula ativa neste curso.",
      );
    }

    const matriculasAtivas =
      await this.coordenadorRepository.contarMatriculasAtivas(turmaId);
    if (
      turma.capacidade !== null &&
      matriculasAtivas >= turma.capacidade
    ) {
      throw new BadRequestError("A turma atingiu sua capacidade maxima.");
    }

    try {
      return await this.coordenadorRepository.vincularAluno({
        alunoId,
        turmaId,
        treinamentoId: turma.treinamentoId,
      });
    } catch (error) {
      throw new BadRequestError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel vincular o aluno a turma.",
      );
    }
  }

  async cancelarMatricula(
    turmaId: string,
    matriculaId: string,
  ): Promise<void> {
    if (!UUID_PATTERN.test(turmaId)) {
      throw new BadRequestError("O ID da turma e invalido.");
    }
    if (!UUID_PATTERN.test(matriculaId)) {
      throw new BadRequestError("O ID da matricula e invalido.");
    }

    const removida = await this.coordenadorRepository.removerMatricula(
      turmaId,
      matriculaId,
    );
    if (!removida) {
      throw new BadRequestError(
        "Matricula nao encontrada para a turma informada.",
      );
    }
  }

  async atualizarStatusMatricula(
    id: string,
    status: string,
  ): Promise<MatriculaStatusAtualizado> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID da matricula e invalido.");
    }
    if (!isStatusMatriculaEditavel(status)) {
      throw new BadRequestError(
        "Status invalido. Use: em_andamento, aprovado ou reprovado_falta.",
      );
    }

    const matricula =
      await this.coordenadorRepository.buscarMatriculaPorId(id);
    if (!matricula) {
      throw new BadRequestError("Matricula nao encontrada.");
    }
    if (matricula.status === "cancelado") {
      throw new BadRequestError(
        "Nao e possivel alterar o status de uma matricula cancelada.",
      );
    }

    const input: AtualizarStatusMatriculaInput = { status };
    const atualizada =
      await this.coordenadorRepository.atualizarStatusMatricula(id, input);
    if (!atualizada) {
      throw new BadRequestError("Matricula nao encontrada.");
    }

    return atualizada;
  }

  async listarFrequencias(
    input: FiltrosFrequenciaEntrada = {},
  ): Promise<FrequenciaCoordenador[]> {
    if (input.periodo && !/^\d{4}\.[12]$/.test(input.periodo)) {
      throw new BadRequestError(
        "Periodo invalido. Use o formato YYYY.S, por exemplo: 2026.1.",
      );
    }

    const filtros: FiltrosFrequenciaCoordenador = {};
    if (input.curso?.trim()) filtros.curso = input.curso.trim();
    if (input.turma?.trim()) filtros.turma = input.turma.trim();
    if (input.aluno?.trim()) filtros.aluno = input.aluno.trim();
    if (input.periodo) filtros.periodo = input.periodo;

    return await this.coordenadorRepository.listarFrequencias(filtros);
  }

  async listarRelatorios(): Promise<RelatorioCoordenador[]> {
    return await this.coordenadorRepository.listarRelatorios();
  }

  async obterRelatorioFiltrado(
    tipo: string,
    filtros: FiltrosRelatorioCoordenador = {},
  ): Promise<RelatorioCoordenador> {
    if (!isTipoRelatorio(tipo)) {
      throw new BadRequestError(
        `Tipo de relatorio invalido. Use: ${TIPOS_RELATORIO.join(", ")}.`,
      );
    }
    if (filtros.dataInicio && !DATA_PATTERN.test(filtros.dataInicio)) {
      throw new BadRequestError("Data inicial invalida. Use YYYY-MM-DD.");
    }
    if (filtros.dataFim && !DATA_PATTERN.test(filtros.dataFim)) {
      throw new BadRequestError("Data final invalida. Use YYYY-MM-DD.");
    }
    if (
      filtros.dataInicio &&
      filtros.dataFim &&
      filtros.dataFim < filtros.dataInicio
    ) {
      throw new BadRequestError(
        "A data final nao pode ser anterior a data inicial.",
      );
    }

    const relatorios = await this.coordenadorRepository.listarRelatorios();
    const relatorio = relatorios.find((item) => item.type === tipo);
    if (!relatorio) {
      throw new BadRequestError("Relatorio nao encontrado.");
    }

    const curso = filtros.curso?.trim();
    const turma = filtros.turma?.trim();
    const rows = relatorio.rows.filter((row) => {
      if (
        filtros.dataInicio &&
        (!row.data || row.data < filtros.dataInicio)
      ) {
        return false;
      }
      if (filtros.dataFim && (!row.data || row.data > filtros.dataFim)) {
        return false;
      }
      if (curso && row.curso !== curso) return false;
      if (turma && row.turma !== turma) return false;
      return true;
    });

    const filtrado: RelatorioCoordenador = { ...relatorio, rows };
    return { ...filtrado, metricValue: calcularMetricaRelatorio(filtrado) };
  }

  async gerarRelatorioPersistido(input: {
    tipo: string;
    filtros?: FiltrosRelatorioCoordenador;
    geradoPorId: string;
  }): Promise<RelatorioGerado> {
    if (!UUID_PATTERN.test(input.geradoPorId)) {
      throw new BadRequestError("O usuario gerador e invalido.");
    }
    if (!isTipoRelatorio(input.tipo)) {
      throw new BadRequestError(
        `Tipo de relatorio invalido. Use: ${TIPOS_RELATORIO.join(", ")}.`,
      );
    }

    const filtros = input.filtros ?? {};
    const relatorio = await this.obterRelatorioFiltrado(input.tipo, filtros);
    const csv = gerarRelatorioCsv(relatorio, filtros);
    const pdf = await gerarRelatorioPdf(relatorio, filtros);
    const arquivoCsvNome = montarNomeArquivoRelatorio(input.tipo, "csv");
    const arquivoPdfNome = montarNomeArquivoRelatorio(input.tipo, "pdf");
    const caminhoCsv = buildRelatorioPath(arquivoCsvNome);
    const caminhoPdf = buildRelatorioPath(arquivoPdfNome);

    await ensureRelatoriosDir();
    await Promise.all([fs.writeFile(caminhoCsv, csv), fs.writeFile(caminhoPdf, pdf)]);

    try {
      return await this.coordenadorRepository.criarRelatorioGerado({
        tipo: input.tipo,
        titulo: relatorio.title,
        arquivoCsv: buildRelatorioRelativePath(arquivoCsvNome),
        arquivoPdf: buildRelatorioRelativePath(arquivoPdfNome),
        filtros,
        geradoPorId: input.geradoPorId,
      });
    } catch (error) {
      await Promise.allSettled([fs.unlink(caminhoCsv), fs.unlink(caminhoPdf)]);
      throw error;
    }
  }

  async listarRelatoriosGerados(limite?: number): Promise<RelatorioGerado[]> {
    return await this.coordenadorRepository.listarRelatoriosGerados(limite);
  }

  async obterRelatorioGerado(id: string): Promise<RelatorioGerado> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID do relatorio e invalido.");
    }

    const relatorio = await this.coordenadorRepository.buscarRelatorioGeradoPorId(
      id,
    );
    if (!relatorio) {
      throw new NotFoundError("Relatorio gerado nao encontrado.");
    }

    return relatorio;
  }

  async deletarRelatorioGerado(id: string): Promise<void> {
    const relatorio = await this.obterRelatorioGerado(id);
    await Promise.allSettled([
      removeRelatorioFile(relatorio.arquivoCsv),
      removeRelatorioFile(relatorio.arquivoPdf),
    ]);
    await this.coordenadorRepository.removerRelatorioGerado(id);
  }

  async listarCertificados(): Promise<CertificadoListagemCoordenador[]> {
    return await this.coordenadorRepository.listarCertificados();
  }

  async buscarCertificado(
    tipo: string,
    referenciaId: string,
  ): Promise<CertificadoDetalhe> {
    if (!isTipoCertificado(tipo)) {
      throw new BadRequestError(
        "Tipo de certificado invalido. Use: aluno.",
      );
    }
    if (!UUID_PATTERN.test(referenciaId)) {
      throw new BadRequestError("O ID de referencia e invalido.");
    }

    const certificado =
      await this.coordenadorRepository.buscarCertificadoAluno(referenciaId);
    if (!certificado) {
      throw new BadRequestError("Certificado ou vinculo nao encontrado.");
    }
    if (
      certificado.status !== "emitido" ||
      !certificado.certificadoId ||
      !certificado.codigo ||
      !certificado.dataEmissao
    ) {
      throw new BadRequestError("O certificado ainda nao foi emitido.");
    }

    return certificado;
  }

  async emitirCertificadoAluno(
    matriculaId: string,
    emitidoPorId: string,
  ): Promise<CertificadoDetalhe> {
    if (!UUID_PATTERN.test(matriculaId)) {
      throw new BadRequestError("O ID da matricula e invalido.");
    }
    if (!UUID_PATTERN.test(emitidoPorId)) {
      throw new BadRequestError("O usuario emissor e invalido.");
    }

    const candidato =
      await this.coordenadorRepository.buscarCertificadoAluno(matriculaId);
    if (!candidato) {
      throw new BadRequestError("Matricula nao encontrada.");
    }
    if (candidato.certificadoId && candidato.status !== "cancelado") {
      throw new BadRequestError("Esta matricula ja possui um certificado pendente ou emitido.");
    }
    if (candidato.statusMatricula !== "aprovado") {
      throw new BadRequestError(
        "O certificado so pode ser emitido para uma matricula aprovada.",
      );
    }
    if (candidato.frequencia <= 70) {
      throw new BadRequestError(
        "O certificado nao pode ser emitido: a frequencia do aluno esta em 70% ou menos.",
      );
    }
    if (candidato.frequencia < 80) {
      throw new BadRequestError(
        "O certificado exige frequencia minima de 80%.",
      );
    }
    if (candidato.statusUsuario !== "ativo") {
      throw new BadRequestError(
        "O certificado so pode ser emitido para um aluno ativo.",
      );
    }

    const configMaxFaltas = parseInt(
      (await this.configuracoeRepository.obterValor("certificado_maximo_faltas")) ?? "2",
      10,
    );
    const configApenasEncerrada =
      (await this.configuracoeRepository.obterValor("certificado_apenas_encerrada")) === "true";

    if (
      configApenasEncerrada &&
      candidato.statusTurma !== "concluida" &&
      candidato.statusTurma !== "encerrada"
    ) {
      throw new BadRequestError(
        "O certificado so pode ser emitido apos a conclusao da turma.",
      );
    }
    if (candidato.faltas > configMaxFaltas) {
      throw new BadRequestError(
        `O certificado exige no maximo ${configMaxFaltas} falta(s).`,
      );
    }

    const oldUrlArquivo = candidato.urlArquivo;

    try {
      const certificado =
        await this.coordenadorRepository.emitirCertificadoAluno({
          matriculaId,
          emitidoPorId,
          codigo: gerarCodigoCertificado(),
        });
      if (!certificado) {
        throw new BadRequestError("Matricula nao encontrada.");
      }

      if (!certificado.certificadoId) {
        throw new Error("Falha ao recuperar o ID do certificado emitido.");
      }

      try {
        const pdf = await gerarCertificadoPdf(certificado);
        const certificadosDir = getCertificadosStorageDir();
        await fs.mkdir(certificadosDir, { recursive: true });
        const arquivoNome = `cert-${certificado.codigo}.pdf`;
        const arquivoCaminho = path.join(certificadosDir, arquivoNome);
        await fs.writeFile(arquivoCaminho, pdf);
        const urlArquivo = `/storage/certificados/${arquivoNome}`;
        await this.coordenadorRepository.atualizarUrlArquivoCertificado(
          certificado.certificadoId,
          urlArquivo,
        );
      } catch (erroPdf) {
        console.error(
          "Falha ao salvar PDF do certificado:",
          erroPdf,
        );
      }

      if (oldUrlArquivo) {
        this.removerPdfAntigoCertificado(oldUrlArquivo, certificado.codigo);
      }

      return certificado;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel emitir o certificado do aluno.",
      );
    }
  }

  async cancelarCertificado(
    tipo: string,
    certificadoId: string,
  ): Promise<void> {
    if (!isTipoCertificado(tipo)) {
      throw new BadRequestError(
        "Tipo de certificado invalido. Use: aluno.",
      );
    }
    if (!UUID_PATTERN.test(certificadoId)) {
      throw new BadRequestError("O ID do certificado e invalido.");
    }

    const cancelado =
      await this.coordenadorRepository.cancelarCertificado(certificadoId);
    if (!cancelado) {
      throw new BadRequestError(
        "Certificado nao encontrado ou ja cancelado.",
      );
    }
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

    // Cadastro pela coordenacao NAO dispara e-mail (decisao do usuario em
    // 2026-09-10). A ativacao fica registrada e pendente: quando esse
    // instrutor precisar entrar, a coordenacao usa "Reenviar ativacao" e ai
    // sim o link vai por e-mail. Quem recebe e-mail sozinho e so o cadastro
    // publico do aluno, onde a propria pessoa informa o endereco.
    void tokenAtivacao;

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
    // Cadastro pela coordenacao NAO dispara e-mail (decisao do usuario em
    // 2026-09-10): sao ~150 ex-alunos entrando de uma vez, com o historico
    // deles, e uma rajada dessas queimaria a cota diaria do Gmail. A matricula
    // ja nasce em andamento; a conta fica pendente de ativacao ate alguem
    // pedir "Reenviar ativacao".
    void token;

    // Caminho de volta de quem foi excluido por engano: cadastrar o mesmo CPF
    // pela coordenacao tira ele da lista de bloqueio do cadastro publico.
    await this.coordenadorRepository.liberarCpfBloqueado(cpf);

    return convite;
  }

  async convidarCoordenador(
    input: ConvidarCoordenadorEntrada,
  ): Promise<ConviteCriado> {
    if (!input.nome || input.nome.trim() === "") {
      throw new BadRequestError("O nome do coordenador e obrigatorio.");
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

    const convite = await this.coordenadorRepository.convidarCoordenador({
      nome: input.nome.trim(),
      email: emailNormalizado,
      cpf: cpfNormalizado,
      telefone: input.telefone ?? null,
      areaCoordenacao: input.areaCoordenacao ?? null,
      senhaTemporariaCriptografada,
    });
    const camposPendentes: CampoPendenteAtivacao[] = ["senha"];
    if (!input.telefone) {
      camposPendentes.push("whatsapp");
    }
    if (!input.areaCoordenacao) {
      camposPendentes.push("areaCoordenacao");
    }
    const tokenAtivacao = await this.activationUseCase.criar(
      convite.usuarioId,
      "criado_por_coordenador",
      camposPendentes,
    );

    const frontendUrl = getRequiredEnv("FRONTEND_URL");
    const linkAtivacao = `${frontendUrl}/ativar-conta?token=${tokenAtivacao}`;

    try {
      await this.emailService.enviar(
        convite.email,
        "Convite para acessar o ADM Para Todos",
        `<p>Ola, ${convite.nome}!</p>
         <p>Voce foi cadastrado como coordenador no ADM Para Todos.</p>
         <p><a href="${linkAtivacao}">Clique aqui para definir sua senha e ativar sua conta</a></p>
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

  async atualizarTurma(id: string, input: {
    nome: string;
    curso: string;
    instrutores: string[];
    periodoLetivo: string;
    capacidade: number;
    status: string;
  }): Promise<TurmaListagem> {
    if (!id) {
      throw new BadRequestError("O ID da turma e obrigatorio.");
    }

    if (!input.nome || input.nome.trim() === "") {
      throw new BadRequestError("O nome da turma e obrigatorio.");
    }

    if (!input.curso || input.curso.trim() === "") {
      throw new BadRequestError("O curso e obrigatorio.");
    }

    if (!input.instrutores || input.instrutores.length === 0) {
      throw new BadRequestError("Selecione pelo menos um instrutor.");
    }

    if (!input.periodoLetivo || !PERIODO_REGEX.test(input.periodoLetivo)) {
      throw new BadRequestError("Informe um periodo letivo valido no formato 2026.1 ou 2026.2.");
    }

    if (!input.capacidade || input.capacidade <= 0) {
      throw new BadRequestError("A capacidade deve ser maior que zero.");
    }

    if (!TURMA_STATUS_VALIDOS.includes(input.status)) {
      throw new BadRequestError("Status de turma invalido.");
    }

    const turmaExistente = await this.coordenadorRepository.buscarTurmaDetalhe(id);
    if (!turmaExistente) {
      throw new BadRequestError("Turma nao encontrada.");
    }

    const treinamento = await this.coordenadorRepository.buscarTreinamentoPorNome(input.curso.trim());
    if (!treinamento) {
      throw new BadRequestError("Curso nao encontrado.");
    }

    const instrutorIds: string[] = [];
    for (const nome of input.instrutores) {
      const instrutor = await this.coordenadorRepository.buscarInstrutorAtivoPorNome(nome.trim());
      if (!instrutor) {
        throw new BadRequestError(`Instrutor "${nome.trim()}" nao encontrado ou inativo.`);
      }
      instrutorIds.push(instrutor.id);
    }

    try {
      const datas = derivarDatasDoPeriodo(input.periodoLetivo);

      const turma = await this.coordenadorRepository.atualizarTurma(id, {
        nome: input.nome.trim(),
        treinamentoId: treinamento.id,
        instrutorIds,
        periodoLetivo: input.periodoLetivo,
        dataInicio: datas.dataInicio,
        dataFim: datas.dataFim,
        capacidade: input.capacidade,
        status: input.status,
      });

      if (!turma) {
        throw new BadRequestError("Turma nao encontrada.");
      }

      return turma;
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async excluirTurma(id: string): Promise<void> {
    if (!UUID_PATTERN.test(id)) {
      throw new BadRequestError("O ID da turma e invalido.");
    }

    const excluida = await this.coordenadorRepository.excluirTurma(id);

    if (!excluida) {
      throw new NotFoundError("Turma nao encontrada.");
    }
  }

  async criarTurma(input: CriarTurmaEntrada): Promise<TurmaListagem> {
    if (!input.curso || input.curso.trim() === "") {
      throw new BadRequestError("O curso e obrigatorio.");
    }

    if (!input.nome || input.nome.trim() === "") {
      throw new BadRequestError("O nome da turma e obrigatorio.");
    }

    if (!input.instrutores || input.instrutores.length === 0) {
      throw new BadRequestError("Selecione pelo menos um instrutor.");
    }

    if (!input.periodoLetivo || !PERIODO_REGEX.test(input.periodoLetivo)) {
      throw new BadRequestError("Informe um periodo letivo valido no formato 2026.1 ou 2026.2.");
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

    const instrutorIds: string[] = [];
    for (const nomeInstrutor of input.instrutores) {
      const instrutor = await this.coordenadorRepository.buscarInstrutorAtivoPorNome(
        nomeInstrutor.trim(),
      );
      if (!instrutor) {
        throw new BadRequestError(
          `Instrutor "${nomeInstrutor.trim()}" nao encontrado ou inativo.`,
        );
      }
      instrutorIds.push(instrutor.id);
    }

    try {
      const datas = derivarDatasDoPeriodo(input.periodoLetivo);

      return await this.coordenadorRepository.criarTurma({
        treinamentoId: treinamento.id,
        instrutorIds,
        coordenadorId: input.coordenadorId ?? null,
        nome: input.nome.trim(),
        periodoLetivo: input.periodoLetivo,
        dataInicio: datas.dataInicio,
        dataFim: datas.dataFim,
        horario: input.horario.trim(),
        limiteAlunos: input.limiteAlunos,
        status: statusFrontend,
      });
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  async obterPerfil(usuarioId: string): Promise<PerfilCoordenador> {
    if (!usuarioId) {
      throw new BadRequestError("Usuario nao identificado.");
    }

    const perfil =
      await this.coordenadorRepository.buscarPerfilCoordenador(usuarioId);

    if (!perfil) {
      throw new BadRequestError("Perfil nao encontrado.");
    }

    return perfil;
  }

  async atualizarAvatarCoordenador(
    usuarioId: string,
    avatarUrl: string,
  ): Promise<void> {
    if (!avatarUrl || avatarUrl.trim() === "") {
      throw new BadRequestError("A foto enviada e invalida.");
    }

    await this.coordenadorRepository.atualizarAvatarCoordenador(
      usuarioId,
      avatarUrl,
    );
  }

  async removerAvatarCoordenador(usuarioId: string): Promise<void> {
    await this.coordenadorRepository.atualizarAvatarCoordenador(
      usuarioId,
      null,
    );
  }

  async obterPeriodoLetivo(): Promise<PeriodoLetivoResponse> {
    return await this.coordenadorRepository.buscarPeriodoLetivo();
  }

  async atualizarPeriodoLetivo(
    periodoLetivo: string,
    usuarioId: string,
  ): Promise<PeriodoLetivoResponse> {
    if (!PERIODO_REGEX.test(periodoLetivo)) {
      throw new BadRequestError(MENSAGEM_PERIODO_INVALIDO);
    }

    return await this.coordenadorRepository.salvarPeriodoLetivo(
      periodoLetivo,
      usuarioId,
    );
  }

  async voltarPeriodoAutomatico(): Promise<void> {
    await this.coordenadorRepository.excluirPeriodoLetivoManual();
  }

  private async removerPdfAntigoCertificado(
    oldUrlArquivo: string,
    newCodigo: string | null,
  ): Promise<void> {
    try {
      const storageBase = getCertificadosStorageDir();
      const filename = path.basename(oldUrlArquivo);
      const oldFilePath = path.join(storageBase, filename);

      const expectedFile = newCodigo
        ? path.join(storageBase, `cert-${newCodigo}.pdf`)
        : null;

      if (!oldFilePath.startsWith(storageBase)) return;

      if (expectedFile && oldFilePath === expectedFile) return;

      await fs.unlink(oldFilePath);
    } catch {
      // best-effort: falha ao deletar PDF antigo nao desfaz a reemissao
    }
  }
}
