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
  dataCriacao: string;
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
  cpf: string | null;
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

export interface ConvidarInstrutorInput {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
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
  listarAlunos(): Promise<AlunoListagemCoordenador[]>;
  buscarAlunoDetalhe(id: string): Promise<AlunoDetalheCoordenador | null>;
  atualizarAluno(
    id: string,
    input: AtualizarAlunoCoordenadorInput,
  ): Promise<AlunoDetalheCoordenador | null>;
  buscarInstrutorAtivoPorNome(nome: string): Promise<IdentificadorPorNome | null>;
  buscarUsuarioPorEmail(email: string): Promise<{ id: string } | null>;
  buscarUsuarioPorCpf(cpf: string): Promise<{ id: string } | null>;
  convidarInstrutor(input: ConvidarInstrutorInput): Promise<ConviteCriado>;
  convidarAluno(input: ConvidarAlunoInput): Promise<ConviteCriado>;

  listarTurmas(): Promise<TurmaListagem[]>;
  buscarTurmaDetalhe(id: string): Promise<TurmaDetalhe | null>;
  criarTurma(input: CriarTurmaInput): Promise<TurmaListagem>;
  buscarTreinamentoPorNome(nome: string): Promise<IdentificadorPorNome | null>;

}
