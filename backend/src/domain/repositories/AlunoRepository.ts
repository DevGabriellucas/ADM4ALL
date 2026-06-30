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

export interface AlunoRepository {
  cadastrar(aluno: Aluno): Promise<Aluno>;
  buscarPorId(id: string): Promise<Aluno | null>;
  buscarPorCpf(cpf: string): Promise<Aluno | null>;
  buscarPorEmail(email: string): Promise<Aluno | null>;
  buscarPorEmailOuCpf(identificador: string): Promise<Aluno | null>;
  buscarUsuarioPorEmail(email: string): Promise<UsuarioRecuperacaoSenha | null>;
  existeRecuperacaoSenhaRecente(usuarioId: string, intervaloMinutos: number): Promise<boolean>;
  registrarRecuperacaoSenha(dados: RegistrarRecuperacaoSenhaInput): Promise<void>;
  buscarRecuperacaoValidaPorTokenHash(tokenHash: string): Promise<RecuperacaoSenhaValida | null>;
  redefinirSenhaUsuario(
    usuarioId: string,
    novaSenhaHash: string,
    recuperacaoId: string,
  ): Promise<void>;
  listarTodos(): Promise<Aluno[]>;
  atualizar(aluno: Aluno): Promise<Aluno>;
  deletar(id: string): Promise<void>;
}
