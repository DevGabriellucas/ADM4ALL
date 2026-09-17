import bcrypt from "bcrypt";
import {
  AuthRepository,
  SessaoUsuario,
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

  /**
   * Confere, a cada requisicao, se a conta do token ainda existe e esta ativa.
   *
   * Sem isso o JWT sobrevive ao dono: excluir ou bloquear alguem nao derrubava
   * a sessao aberta, e o token seguia valido ate expirar. O sintoma era erro em
   * cascata — a autenticacao passava e a consulta estourava la na frente, com
   * uma mensagem que nao dizia ao usuario para entrar de novo.
   *
   * Devolve os vinculos do banco em vez dos que vieram no token: se a
   * coordenacao vincular o aluno a outra turma, a sessao aberta acompanha.
   */
  async validarSessao(usuarioId: string): Promise<SessaoUsuario> {
    const sessao = await this.authRepository.buscarSessaoPorUsuarioId(usuarioId);

    if (!sessao) {
      throw new UnauthorizedError(
        "Sua conta nao esta mais disponivel. Entre novamente.",
      );
    }

    if (sessao.status !== "ativo") {
      throw new UnauthorizedError(
        "Sua conta nao esta ativa. Entre em contato com a coordenacao do curso.",
      );
    }

    return sessao;
  }

  async login(identificador: string, senha: string): Promise<LoginResultado> {
    if (!identificador || !senha) {
      throw new BadRequestError("Identificador e senha sao obrigatorios.");
    }

    const usuario = await this.authRepository.buscarUsuarioPorIdentificador(
      identificador.trim(),
    );

    if (!usuario) {
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    const senhaCorreta =
      Boolean(usuario.senhaHash) &&
      (await bcrypt.compare(senha, usuario.senhaHash));
    if (!senhaCorreta) {
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    // A conferencia de status vem depois da senha de proposito: assim o login
    // nao vira um consultor de contas para quem nao sabe a senha. Quem acertou
    // a senha e so nao ativou merece saber o motivo — antes recebia
    // "Credenciais invalidas" e ficava tentando trocar a senha a toa.
    if (usuario.status === "pendente_ativacao") {
      throw new UnauthorizedError(
        "Sua conta ainda não foi ativada. Abra o link de ativação enviado para o seu e-mail. Se não recebeu, procure a coordenação do curso para reenviar o link.",
      );
    }

    if (usuario.status !== "ativo") {
      throw new UnauthorizedError("Credenciais inválidas.");
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
