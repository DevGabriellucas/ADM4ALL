import bcrypt from "bcrypt";
import {
  AuthRepository,
  UsuarioAutenticacao,
} from "../../domain/repositories/AuthRepository";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { UnauthorizedError } from "../../infrastructure/errors/UnauthorizedError";
import { JwtService } from "../security/JwtService";

export interface LoginResultado {
  mensagem: string;
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
    alunoId: string | null;
    instrutorId: string | null;
    coordenadorId: string | null;
  };
  aluno?: {
    id: string | null;
    nome: string;
  };
}

export class AuthUseCase {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async login(identificador: string, senha: string): Promise<LoginResultado> {
    if (!identificador || !senha) {
      throw new BadRequestError("Identificador e senha sao obrigatorios.");
    }

    const usuario = await this.authRepository.buscarUsuarioPorIdentificador(
      identificador.trim(),
    );

    if (!usuario || usuario.status !== "ativo") {
      throw new UnauthorizedError("Credenciais invalidas.");
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaCorreta) {
      throw new UnauthorizedError("Credenciais invalidas.");
    }

    await this.authRepository.registrarUltimoLogin(usuario.id);

    const token = this.jwtService.gerar({
      sub: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      alunoId: usuario.alunoId,
      instrutorId: usuario.instrutorId,
      coordenadorId: usuario.coordenadorId,
    });

    const resultado: LoginResultado = {
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: this.mapearUsuario(usuario),
    };

    if (usuario.perfil === "aluno") {
      resultado.aluno = { id: usuario.alunoId, nome: usuario.nome };
    }

    return resultado;
  }

  private mapearUsuario(usuario: UsuarioAutenticacao) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      alunoId: usuario.alunoId,
      instrutorId: usuario.instrutorId,
      coordenadorId: usuario.coordenadorId,
    };
  }
}
