// Repositorio usado pela area do coordenador/admin.
// Dashboard e listagens sao majoritariamente agregacao de leitura sobre
// tabelas ja existentes (treinamentos, turmas, instrutores, alunos, etc.).
import type {
  CampoPendenteAtivacao,
  OrigemAtivacao,
} from "./ActivationRepository";

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
}

export interface MatriculaEncontrada {
  id: string;
  turmaId: string | null;
  status: string;
}

export type StatusMatriculaEditavel =
  | "em_andamento"
  | "aprovado"
  | "reprovado_falta";

export interface AtualizarStatusMatriculaInput {
  status: StatusMatriculaEditavel;
}

export interface MatriculaStatusAtualizado {
  id: string;
  status:
    | "em_andamento"
    | "aprovado"
    | "reprovado_falta"
    | "cancelado";
  dataConclusao: string | null;
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
  presencas: number;
  faltas: number;
  frequencia: number;
  situacao: "regular" | "atencao" | "risco" | "reprovado_falta";
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
  vincularAluno(input: VincularAlunoInput): Promise<MatriculaCriada>;
  removerMatricula(turmaId: string, matriculaId: string): Promise<boolean>;
  buscarMatriculaPorId(
    id: string,
  ): Promise<{ id: string; status: string } | null>;
  atualizarStatusMatricula(
    id: string,
    input: AtualizarStatusMatriculaInput,
  ): Promise<MatriculaStatusAtualizado | null>;
  listarFrequencias(
    filtros: FiltrosFrequenciaCoordenador,
  ): Promise<FrequenciaCoordenador[]>;
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
