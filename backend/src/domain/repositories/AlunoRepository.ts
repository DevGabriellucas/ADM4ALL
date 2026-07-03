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
  redefinirSenhaUsuario(
    usuarioId: string,
    novaSenhaHash: string,
    recuperacaoId: string,
  ): Promise<void>;
  listarTodos(): Promise<Aluno[]>;
  atualizar(aluno: Aluno): Promise<Aluno>;
  deletar(id: string): Promise<void>;
}
