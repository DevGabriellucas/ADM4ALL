// Repositorio usado pela area do coordenador/admin.
// Dashboard e listagens sao majoritariamente agregacao de leitura sobre
// tabelas ja existentes (treinamentos, turmas, instrutores, alunos, etc.).
import type { Pagina, Paginacao } from "../paginacao";
import type {
  CampoPendenteAtivacao,
  OrigemAtivacao,
} from "./ActivationRepository";

// Os cartoes do topo da tela de Alunos contam a base inteira, e nao a pagina
// aberta, entao o total de cada um viaja junto com a pagina.
export interface ResumoDeAlunos {
  ativos: number;
  pendentes: number;
  emRisco: number;
}

export interface PaginaDeAlunos extends Pagina<AlunoListagemCoordenador> {
  resumo: ResumoDeAlunos;
}

// Os filtros da tela de Usuarios rodavam no navegador sobre a lista inteira.
// Com pagina, eles precisam ir ao banco: filtrar so a pagina aberta esconderia
// quem esta nas outras.
export interface FiltrosDeUsuarios {
  /** Casa com nome, e-mail ou CPF. */
  busca?: string | null;
  perfil?: string | null;
  status?: string | null;
  ordenacao?: string | null;
}

export interface FiltrosDeCertificados {
  curso?: string | null;
  turma?: string | null;
  /** elegivel | pendente | emitido | cancelado | nao_elegivel */
  status?: string | null;
}

// Os cartoes de Certificados contam sobre o resultado FILTRADO, e nao sobre a
// base inteira, entao acompanham a pagina.
export interface ResumoDeCertificados {
  elegiveis: number;
  pendentes: number;
  emitidos: number;
  inelegiveis: number;
}

export interface PaginaDeCertificados
  extends Pagina<CertificadoListagemCoordenador> {
  resumo: ResumoDeCertificados;
}

export interface ResumoDeCursos {
  ativos: number;
  encerrados: number;
  desativados: number;
  emPlanejamento: number;
  semTurma: number;
}

export interface PaginaDeCursos extends Pagina<CursoResumo> {
  resumo: ResumoDeCursos;
}

export interface ResumoDeTurmas {
  emAndamento: number;
  encerradas: number;
  matriculados: number;
  mediaFrequencia: number;
}

export interface PaginaDeTurmas extends Pagina<TurmaListagem> {
  resumo: ResumoDeTurmas;
}

export interface ResumoDeInstrutores {
  ativos: number;
  pendentes: number;
  turmasVinculadas: number;
}

export interface PaginaDeInstrutores extends Pagina<InstrutorListagem> {
  resumo: ResumoDeInstrutores;
}

export interface DashboardResumo {
  totalCursos: number;
  totalTurmas: number;
  totalAlunos: number;
  totalInstrutores: number;
  frequenciaMedia: number;
  certificadosPendentes: number;
  processosAbertos: number;
  usuariosPendentes: number;
}

export interface CursoResumo {
  id: string;
  nome: string;
  descricao: string | null;
  cargaHoraria: number;
  /** Formato AAAA.P (ex.: 2026.1). Nulo em curso cadastrado antes do campo. */
  periodoLetivo: string | null;
  /**
   * Derivado das turmas do curso na consulta, nao gravado: em planejamento
   * enquanto nao ha turma com aluno, ativo quando ha, encerrado quando todas
   * as turmas que valem chegaram ao fim do cronograma, e desativado quando
   * todas as turmas do curso estao canceladas.
   */
  status: string;
  quantidadeTurmas: number;
}

export interface CriarCursoInput {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  periodoLetivo: string;
}

export interface AtualizarCursoInput {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  periodoLetivo: string;
}

export interface InstrutorListagem {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  status: string;
  turmasVinculadas: number;
  dataCriacao: string;
}

export interface TurmaInstrutorCoordenador {
  id: string;
  nome: string;
  curso: string;
  status: string;
  dataInicio: string;
  dataTermino: string | null;
  alunos: number;
}

export interface InstrutorDetalheCoordenador extends InstrutorListagem {
  usuarioId: string;
  areaAtuacao: string | null;
  formacao: string | null;
  ativo: boolean;
  turmas: TurmaInstrutorCoordenador[];
}

export interface AtualizarInstrutorCoordenadorInput {
  nome: string;
  email: string;
  telefone: string | null;
  areaAtuacao: string | null;
  formacao: string | null;
}

export interface InstrutorParaReenvioAtivacao {
  usuarioId: string;
  nome: string;
  email: string;
  status: string;
  origem: OrigemAtivacao | null;
  camposPendentes: CampoPendenteAtivacao[];
}

export type StatusTurma =
  | "planejada"
  | "em_andamento"
  | "concluida"
  | "encerrada"
  | "cancelada";

export interface AlunoListagemCoordenador {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  turma: string | null;
  curso: string | null;
  frequencia: number;
  statusConta: "ativo" | "inativo" | "bloqueado" | "pendente_ativacao";
  statusMatricula:
    | "em_andamento"
    | "aprovado"
    | "reprovado_falta"
    | "cancelado"
    | null;
  statusTurma: StatusTurma | null;
  dataCriacao: string;
  /**
   * A matricula e a turma que a linha esta mostrando. A tela de Alunos usa as
   * duas para desvincular o aluno direto da lista, sem abrir a ficha.
   */
  matriculaId: string | null;
  turmaId: string | null;
}

export interface UsuarioListagemCoordenador {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  role: "administrador" | "coordenador" | "instrutor" | "aluno";
  status: "ativo" | "inativo" | "bloqueado" | "pendente_ativacao";
  dataCriacao: string;
  ultimoAcesso: string | null;
}

export interface AtualizarUsuarioInput {
  nome: string;
  email: string;
  cpf: string;
}

export interface MatriculaAlunoCoordenador {
  id: string;
  turmaId: string | null;
  turma: string | null;
  curso: string | null;
  status: "em_andamento" | "aprovado" | "reprovado_falta" | "cancelado";
  frequencia: number;
  dataMatricula: string;
}

export interface AlunoDetalheCoordenador {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string | null;
  dataNascimento: string | null;
  rgm: string | null;
  cursoUnipe: string | null;
  statusConta: "ativo" | "inativo" | "bloqueado" | "pendente_ativacao";
  dataCriacao: string;
  matriculas: MatriculaAlunoCoordenador[];
}

export interface AtualizarAlunoCoordenadorInput {
  nome: string;
  email: string;
  telefone: string | null;
  statusConta: AlunoDetalheCoordenador["statusConta"];
}

export interface AlunoParaReenvioAtivacao {
  usuarioId: string;
  nome: string;
  email: string;
  status: string;
  origem: OrigemAtivacao | null;
  camposPendentes: CampoPendenteAtivacao[];
}

export interface VincularAlunoInput {
  alunoId: string;
  turmaId: string;
  treinamentoId: string;
}

export interface MatriculaCriada {
  id: string;
  alunoId: string;
  turmaId: string;
  treinamentoId: string;
  status: "em_andamento" | "aprovado" | "reprovado_falta" | "cancelado";
  dataMatricula: string;
}

export interface TurmaParaMatricula {
  id: string;
  treinamentoId: string;
  status: string;
  capacidade: number | null;
  periodoLetivo: string;
}

export interface MatriculaEncontrada {
  id: string;
  turmaId: string | null;
  status: string;
}

/**
 * A matricula que ja ocupa o periodo letivo do aluno, com o nome da turma e do
 * curso para a coordenacao saber de onde precisa desvincular.
 */
export interface MatriculaNoPeriodo {
  id: string;
  turmaId: string;
  turmaNome: string;
  cursoNome: string;
  periodoLetivo: string;
  status: string;
}

export interface FiltrosFrequenciaCoordenador {
  curso?: string;
  turma?: string;
  aluno?: string;
  periodo?: string;
}

export interface FrequenciaCoordenador {
  aluno: string;
  turma: string;
  /**
   * Status da turma do aluno. O painel usa para nao cobrar acao sobre turma
   * que ja terminou: falta em turma encerrada e historico, nao pendencia.
   */
  statusTurma: string;
  presencas: number;
  faltas: number;
  frequencia: number;
  situacao:
    | "regular"
    | "atencao"
    | "risco"
    | "reprovado_falta"
    | "sem_registro";
}

export type TipoCertificado = "aluno";
export type StatusCertificado = "pendente" | "emitido" | "cancelado";

export type CoordinatorReportType =
  | "frequencia_turma"
  | "reprovados_falta"
  | "elegiveis_certificado"
  | "certificados_emitidos"
  | "matriculas_curso"
  | "turmas_andamento";

export type ReportAggregation = "average" | "count" | "sum";

export interface ReportTableColumn {
  key: string;
  label: string;
}

export interface ReportDataRow {
  id: string;
  data: string;
  curso: string;
  turma: string;
  chartLabel: string;
  chartValue: number;
  metricNumerator?: number;
  metricDenominator?: number;
  values: Record<string, string | number>;
}

export interface FiltrosRelatorioCoordenador {
  dataInicio?: string;
  dataFim?: string;
  curso?: string;
  turma?: string;
}

export interface RelatorioCoordenador {
  type: CoordinatorReportType;
  title: string;
  description: string;
  metricLabel: string;
  metricSuffix?: string;
  metricValue?: number;
  aggregation: ReportAggregation;
  columns: ReportTableColumn[];
  rows: ReportDataRow[];
}

export interface RelatorioGerado {
  id: string;
  tipo: CoordinatorReportType;
  titulo: string;
  arquivoCsv: string | null;
  arquivoPdf: string | null;
  filtros: FiltrosRelatorioCoordenador | null;
  geradoPorId: string | null;
  criadoEm: string;
}

export interface CriarRelatorioGeradoInput {
  tipo: CoordinatorReportType;
  titulo: string;
  arquivoCsv: string;
  arquivoPdf: string;
  filtros: FiltrosRelatorioCoordenador;
  geradoPorId: string;
}

export interface CertificadoListagemCoordenador {
  referenciaId: string;
  certificadoId: string | null;
  tipo: "aluno";
  nome: string;
  curso: string;
  turma: string | null;
  frequencia: number;
  elegivel: boolean;
  motivoInelegibilidade: string | null;
  status: StatusCertificado | null;
  codigo: string | null;
  dataEmissao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  cargaHoraria: number | null;
}

export interface CertificadoAlunoDetalhe {
  tipo: "aluno";
  certificadoId: string | null;
  referenciaId: string;
  status: StatusCertificado | null;
  urlArquivo: string | null;
  nomeAluno: string;
  cpfAluno: string;
  nomeCurso: string;
  cargaHoraria: number;
  dataInicio: string;
  dataFim: string;
  dataEmissao: string | null;
  cidade: string;
  nomeCoordenadora: string;
  nomeProjeto: string;
  textoDescritivo: string;
  codigo: string | null;
  statusMatricula: string;
  statusTurma: string;
  statusUsuario: string;
  faltas: number;
  frequencia: number;
}

export type CertificadoDetalhe = CertificadoAlunoDetalhe;

export interface PerfilCoordenador {
  usuarioId: string;
  /** Nulo quando quem acessa e admin sem registro na tabela de coordenadores. */
  coordenadorId: string | null;
  nome: string;
  email: string;
  perfil: string;
  areaCoordenacao: string | null;
  avatarUrl: string | null;
}

export interface PeriodoLetivoResponse {
  periodoLetivo: string;
  origem: "automatico" | "manual";
  atualizadoEm: string | null;
  atualizadoPor: string | null;
}

export interface EmitirCertificadoAlunoInput {
  matriculaId: string;
  codigo: string;
  emitidoPorId: string;
}

export interface ConvidarInstrutorInput {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
  senhaTemporariaCriptografada: string;
}

export interface ConvidarCoordenadorInput {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
  areaCoordenacao?: string | null;
  senhaTemporariaCriptografada: string;
}

export interface ConviteCriado {
  usuarioId: string;
  instrutorId: string;
  nome: string;
  email: string;
}

export interface ConvidarAlunoInput {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
  dataNascimento: string;
  treinamento: string;
  turma: string;
  senhaTemporariaCriptografada: string;
}

export interface TurmaListagem {
  id: string;
  nome: string;
  /** Codigo unico da turma (ex.: ADM-2026-01). Distingue turmas homonimas. */
  codigo: string;
  curso: string;
  instrutores: string;
  alunos: number;
  capacidade: number;
  dataInicio: string;
  dataTermino: string | null;
  periodoLetivo: string;
  status: string;
  frequenciaMedia: number;
  /** Chamadas registradas na turma. 0 significa "ainda sem chamada". */
  registrosFrequencia: number;
}

// Nenhum dos dois leva `status`: a turma nasce "planejada" e dali em diante o
// status e recalculado (ver `atualizarStatusDerivadoDaTurma`). O cancelamento,
// que continua sendo decisao da coordenacao, tem caminho proprio
// (`definirCancelamentoDaTurma`).
export interface CriarTurmaInput {
  treinamentoId: string;
  instrutorIds: string[];
  coordenadorId?: string | null;
  nome: string;
  periodoLetivo: string;
  dataInicio: string;
  dataFim: string;
  horario: string;
  limiteAlunos: number;
}

export interface AtualizarTurmaInput {
  nome: string;
  treinamentoId: string;
  instrutorIds: string[];
  periodoLetivo: string;
  dataInicio: string;
  dataFim: string;
  capacidade: number;
}

export interface AlunoMatriculaResumo {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  frequencia: number;
  status: string;
  matriculaId: string;
}

export interface AulaResumo {
  id: string;
  numeroAula: number;
  titulo: string;
  data: string;
  status: string;
}

export interface TurmaDetalhe {
  turma: TurmaListagem;
  alunos: AlunoMatriculaResumo[];
  cronograma: AulaResumo[];
}

export interface IdentificadorPorNome {
  id: string;
}

// Dados do aluno guardados no momento da exclusao. O usuario e apagado do
// banco, entao o CPF precisa sair de la antes para alimentar a lista de
// bloqueio do cadastro publico.
export interface AlunoExcluido {
  nome: string;
  email: string;
  cpf: string;
}

export interface CoordenadorRepository {
  buscarDashboard(): Promise<DashboardResumo>;

  /** Lista inteira, para combos e seletores. */
  listarCursos(): Promise<CursoResumo[]>;
  listarCursosPaginado(paginacao: Paginacao): Promise<PaginaDeCursos>;
  listarAlunosPaginado(paginacao: Paginacao): Promise<PaginaDeAlunos>;
  listarTurmasPaginado(paginacao: Paginacao): Promise<PaginaDeTurmas>;
  listarUsuariosPaginado(
    paginacao: Paginacao,
    filtros: FiltrosDeUsuarios,
  ): Promise<Pagina<UsuarioListagemCoordenador>>;
  listarInstrutoresPaginado(
    paginacao: Paginacao,
  ): Promise<Pagina<InstrutorListagem>>;
  listarCertificadosPaginado(
    paginacao: Paginacao,
    filtros: FiltrosDeCertificados,
  ): Promise<PaginaDeCertificados>;
  criarCurso(input: CriarCursoInput): Promise<CursoResumo>;
  buscarCursoPorId(id: string): Promise<CursoResumo | null>;
  atualizarCurso(id: string, input: AtualizarCursoInput): Promise<CursoResumo | null>;
  excluirCurso(id: string): Promise<boolean>;
  listarTurmasPorCurso(cursoId: string): Promise<TurmaListagem[]>;

  listarInstrutores(): Promise<InstrutorListagem[]>;
  buscarInstrutorDetalhe(
    id: string,
  ): Promise<InstrutorDetalheCoordenador | null>;
  atualizarInstrutor(
    id: string,
    input: AtualizarInstrutorCoordenadorInput,
  ): Promise<InstrutorDetalheCoordenador | null>;
  atualizarStatusInstrutor(
    id: string,
    statusConta: InstrutorDetalheCoordenador["status"],
  ): Promise<InstrutorDetalheCoordenador | null>;
  excluirInstrutor(id: string): Promise<boolean>;
  buscarUsuarioPorInstrutorId(
    instrutorId: string,
  ): Promise<InstrutorParaReenvioAtivacao | null>;
  listarUsuarios(): Promise<UsuarioListagemCoordenador[]>;
  atualizarUsuario(
    id: string,
    input: AtualizarUsuarioInput,
  ): Promise<UsuarioListagemCoordenador | null>;
  atualizarStatusUsuario(
    id: string,
    status: "ativo" | "inativo",
  ): Promise<UsuarioListagemCoordenador | null>;
  buscarUsuarioPorId(
    id: string,
  ): Promise<UsuarioListagemCoordenador | null>;
  excluirUsuario(id: string): Promise<boolean>;
  contarAdministradoresAtivos(): Promise<number>;
  listarAlunos(): Promise<AlunoListagemCoordenador[]>;
  buscarAlunoDetalhe(id: string): Promise<AlunoDetalheCoordenador | null>;
  atualizarAluno(
    id: string,
    input: AtualizarAlunoCoordenadorInput,
  ): Promise<AlunoDetalheCoordenador | null>;
  excluirAluno(id: string): Promise<AlunoExcluido | null>;
  liberarCpfBloqueado(cpf: string): Promise<void>;
  /**
   * Espelha o bloqueio da conta na lista de CPFs. Bloquear so o login deixava
   * a pessoa se cadastrar de novo com outro e-mail; o CPF e o que impede.
   */
  sincronizarBloqueioCpfDoAluno(
    alunoId: string,
    bloquear: boolean,
    bloqueadoPorId: string | null,
  ): Promise<void>;
  buscarUsuarioPorAlunoId(
    alunoId: string,
  ): Promise<AlunoParaReenvioAtivacao | null>;
  invalidarAtivacoesPendentes(usuarioId: string): Promise<void>;
  buscarTurmaPorId(id: string): Promise<TurmaParaMatricula | null>;
  verificarAlunoExiste(alunoId: string): Promise<boolean>;
  contarMatriculasAtivas(turmaId: string): Promise<number>;
  buscarMatriculaAlunoTurma(
    alunoId: string,
    turmaId: string,
  ): Promise<MatriculaEncontrada | null>;
  buscarMatriculaAtivaNoTreinamento(
    alunoId: string,
    treinamentoId: string,
  ): Promise<MatriculaEncontrada | null>;
  buscarMatriculaNoPeriodo(
    alunoId: string,
    periodoLetivo: string,
    turmaIdIgnorada: string,
  ): Promise<MatriculaNoPeriodo | null>;
  vincularAluno(input: VincularAlunoInput): Promise<MatriculaCriada>;
  removerMatricula(turmaId: string, matriculaId: string): Promise<boolean>;
  /** Sem `paginacao`, devolve a lista inteira (relatorio e exportacao). */
  listarFrequencias(
    filtros: FiltrosFrequenciaCoordenador,
    paginacao?: Paginacao,
  ): Promise<Pagina<FrequenciaCoordenador>>;
  listarRelatorios(): Promise<RelatorioCoordenador[]>;
  criarRelatorioGerado(
    input: CriarRelatorioGeradoInput,
  ): Promise<RelatorioGerado>;
  listarRelatoriosGerados(limite?: number): Promise<RelatorioGerado[]>;
  buscarRelatorioGeradoPorId(id: string): Promise<RelatorioGerado | null>;
  removerRelatorioGerado(id: string): Promise<boolean>;
  listarCertificados(): Promise<CertificadoListagemCoordenador[]>;
  buscarCertificadoAluno(
    matriculaId: string,
  ): Promise<CertificadoAlunoDetalhe | null>;
  emitirCertificadoAluno(
    input: EmitirCertificadoAlunoInput,
  ): Promise<CertificadoAlunoDetalhe | null>;
  cancelarCertificado(certificadoId: string): Promise<boolean>;
  atualizarUrlArquivoCertificado(
    certificadoId: string,
    urlArquivo: string,
  ): Promise<void>;
  buscarInstrutorAtivoPorNome(nome: string): Promise<IdentificadorPorNome | null>;
  buscarUsuarioPorEmail(email: string): Promise<{ id: string } | null>;
  buscarUsuarioPorCpf(cpf: string): Promise<{ id: string } | null>;
  // Perfil de quem esta logado na area da coordenacao (coordenador ou admin).
  convidarInstrutor(input: ConvidarInstrutorInput): Promise<ConviteCriado>;
  convidarAluno(input: ConvidarAlunoInput): Promise<ConviteCriado>;
  convidarCoordenador(input: ConvidarCoordenadorInput): Promise<ConviteCriado>;

  listarTurmas(): Promise<TurmaListagem[]>;
  buscarTurmaDetalhe(id: string): Promise<TurmaDetalhe | null>;
  criarTurma(input: CriarTurmaInput): Promise<TurmaListagem>;
  atualizarTurma(id: string, input: AtualizarTurmaInput): Promise<TurmaListagem | null>;
  definirCancelamentoDaTurma(
    id: string,
    cancelada: boolean,
  ): Promise<TurmaListagem | null>;
  excluirTurma(id: string): Promise<boolean>;
  buscarTreinamentoPorNome(nome: string): Promise<IdentificadorPorNome | null>;

  buscarPerfilCoordenador(usuarioId: string): Promise<PerfilCoordenador | null>;
  atualizarAvatarCoordenador(
    usuarioId: string,
    avatarUrl: string | null,
  ): Promise<void>;
  buscarPeriodoLetivo(): Promise<PeriodoLetivoResponse>;
  salvarPeriodoLetivo(
    periodoLetivo: string,
    usuarioId: string,
  ): Promise<PeriodoLetivoResponse>;

}
