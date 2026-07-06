import { Aluno } from "../entities/Aluno";

export interface UsuarioRecuperacaoSenha {
  id: string;
  nome: string;
  email: string;
}

export interface RegistrarRecuperacaoSenhaInput {
  usuarioId: string;
  tokenHash: string;
  expiraEm: Date;
  ipSolicitante?: string | undefined;
  userAgent?: string | undefined;
}

export interface RecuperacaoSenhaValida {
  recuperacaoId: string;
  usuarioId: string;
}

export type AlunoMatriculaStatus =
  | "em_andamento"
  | "aprovado"
  | "reprovado_falta"
  | "cancelado";

export interface AlunoDashboard {
  nome: string;
  matricula: string | null;
  cursoDeExtensao: {
    nomeCurso: string;
    qtdFaltas: number;
    qtdTotalAulas: number;
    qtdAulasConcluidas: number;
    progresso: number;
    status: AlunoMatriculaStatus;
  };
  certificadoDisponivel: boolean;
  certificadoUrl: string | null;
}

export interface CertificadoEmitidoDoAluno {
  certificadoId: string;
  codigo: string | null;
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
}

export interface MaterialAluno {
  id: string;
  titulo: string;
  tipo: string;
  urlArquivo: string | null;
  turmaId: string;
  turmaNome: string;
  criadoEm: Date;
}

export interface MaterialAlunoDownload {
  id: string;
  titulo: string;
  tipo: string;
  urlArquivo: string | null;
  turmaId: string;
  turmaNome: string;
}

export interface MaterialVisivelAluno {
  id: string;
  turmaId: string;
  turma: string;
  curso: string;
  aulaId: string | null;
  aulaTitulo: string | null;
  titulo: string;
  descricao: string | null;
  tipo: string;
  urlArquivo: string | null;
  tamanhoBytes: number | null;
  dataPublicacao: string;
}

export interface AlunoRepository {
  cadastrar(aluno: Aluno): Promise<Aluno>;
  buscarPorId(id: string): Promise<Aluno | null>;
  buscarPorCpf(cpf: string): Promise<Aluno | null>;
  buscarPorEmail(email: string): Promise<Aluno | null>;
  buscarPorEmailOuCpf(identificador: string): Promise<Aluno | null>;
  buscarUsuarioIdPorAlunoId(alunoId: string): Promise<string | null>;
  buscarUsuarioPorEmail(email: string): Promise<UsuarioRecuperacaoSenha | null>;
  existeRecuperacaoSenhaRecente(usuarioId: string, intervaloMinutos: number): Promise<boolean>;
  registrarRecuperacaoSenha(dados: RegistrarRecuperacaoSenhaInput): Promise<void>;
  buscarRecuperacaoValidaPorTokenHash(tokenHash: string): Promise<RecuperacaoSenhaValida | null>;
  buscarDashboardPorAlunoId(alunoId: string): Promise<AlunoDashboard | null>;
  listarMateriaisVisiveis(alunoId: string): Promise<MaterialVisivelAluno[]>;
  redefinirSenhaUsuario(
    usuarioId: string,
    novaSenhaHash: string,
    recuperacaoId: string,
  ): Promise<void>;
  listarTodos(): Promise<Aluno[]>;
  atualizar(aluno: Aluno): Promise<Aluno>;
  listarMateriaisVisiveisPorAluno(alunoId: string): Promise<MaterialAluno[]>;
  buscarMaterialVisivelParaDownload(
    alunoId: string,
    materialId: string,
  ): Promise<MaterialAlunoDownload | null>;
  buscarCertificadoEmitidoPorAlunoId(
    alunoId: string,
  ): Promise<CertificadoEmitidoDoAluno | null>;
  atualizarUrlArquivoCertificado(
    certificadoId: string,
    urlArquivo: string,
  ): Promise<void>;
  deletar(id: string): Promise<void>;
}
