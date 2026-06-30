// Repositorio usado pela area do coordenador/admin.
// Dashboard e listagens sao majoritariamente agregacao de leitura sobre
// tabelas ja existentes (treinamentos, turmas, instrutores, alunos, etc.).

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
  status: string;
  quantidadeTurmas: number;
}

export interface CriarCursoInput {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  status: string;
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

export interface ConvidarInstrutorInput {
  nome: string;
  email: string;
  telefone?: string | null;
  senhaTemporariaCriptografada: string;
  tokenAtivacaoHash: string;
  tokenExpiraEm: Date;
}

export interface ConviteCriado {
  usuarioId: string;
  instrutorId: string;
  nome: string;
  email: string;
}

export interface TurmaListagem {
  id: string;
  nome: string;
  curso: string;
  instrutor: string | null;
  alunos: number;
  dataInicio: string;
  dataTermino: string | null;
  status: string;
  frequenciaMedia: number;
}

export interface CriarTurmaInput {
  treinamentoId: string;
  instrutorId: string;
  coordenadorId?: string | null;
  nome: string;
  dataInicio: string;
  dataTermino: string;
  horario: string;
  limiteAlunos: number;
  status: string;
}

export interface AlunoMatriculaResumo {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  frequencia: number;
  status: string;
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

export interface CoordenadorRepository {
  buscarDashboard(): Promise<DashboardResumo>;

  listarCursos(): Promise<CursoResumo[]>;
  criarCurso(input: CriarCursoInput): Promise<CursoResumo>;

  listarInstrutores(): Promise<InstrutorListagem[]>;
  buscarInstrutorAtivoPorNome(nome: string): Promise<IdentificadorPorNome | null>;
  buscarUsuarioPorEmail(email: string): Promise<{ id: string } | null>;
  convidarInstrutor(input: ConvidarInstrutorInput): Promise<ConviteCriado>;

  listarTurmas(): Promise<TurmaListagem[]>;
  buscarTurmaDetalhe(id: string): Promise<TurmaDetalhe | null>;
  criarTurma(input: CriarTurmaInput): Promise<TurmaListagem>;
  buscarTreinamentoPorNome(nome: string): Promise<IdentificadorPorNome | null>;

  ativarConta(tokenHash: string, senhaCriptografada: string): Promise<boolean>;
}
