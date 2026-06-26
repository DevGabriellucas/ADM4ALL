export interface UsuarioAutenticacao {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  status: string;
  perfil: string;
  alunoId: string | null;
  instrutorId: string | null;
  coordenadorId: string | null;
}

export interface AuthRepository {
  buscarUsuarioPorIdentificador(
    identificador: string,
  ): Promise<UsuarioAutenticacao | null>;
  registrarUltimoLogin(usuarioId: string): Promise<void>;
}
