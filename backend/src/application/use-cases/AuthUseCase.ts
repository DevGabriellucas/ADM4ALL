import bcrypt from "bcrypt";
import {
  AuthRepository,
  SessaoUsuario,
  UsuarioAutenticacao,
} from "../../domain/repositories/AuthRepository";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { UnauthorizedError } from "../../infrastructure/errors/UnauthorizedError";
import { ControleDeTentativasLogin } from "../security/ControleDeTentativasLogin";
import { JwtService } from "../security/JwtService";

/**
 * As duas mensagens que o login pode devolver quando recusa a entrada.
 *
 * Ficam aqui, em constante, porque o mesmo texto e usado em mais de um ponto do
 * fluxo e precisa ser identico: a de credenciais cobre "conta nao existe" e
 * "senha errada" justamente para nao distinguir os dois casos.
 */
const CREDENCIAIS_INCORRETAS =
  "E-mail, CPF ou senha incorretos. Confira os dados e tente de novo.";

const CONTA_NAO_ATIVA =
  "Sua conta não está ativa. Entre em contato com a coordenação do curso.";

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
    private tentativas = new ControleDeTentativasLogin(),
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
      throw new UnauthorizedError(CONTA_NAO_ATIVA);
    }

    return sessao;
  }

  async login(identificador: string, senha: string): Promise<LoginResultado> {
    if (!identificador || !senha) {
      throw new BadRequestError("Identificador e senha sao obrigatorios.");
    }

    // A trava vem ANTES de consultar o banco: o objetivo e justamente parar a
    // varredura antes de ela custar uma consulta por tentativa.
    const minutosBloqueado = this.tentativas.minutosBloqueado(identificador);

    if (minutosBloqueado !== null) {
      throw new UnauthorizedError(
        `Muitas tentativas de entrada. Aguarde ${minutosBloqueado} ` +
          `minuto(s) e tente de novo.`,
      );
    }

    const usuario = await this.authRepository.buscarUsuarioPorIdentificador(
      identificador.trim(),
    );

    // Conta inexistente e senha errada saem com a MESMA mensagem, de proposito:
    // mensagens diferentes transformariam o login num consultor de quem tem
    // cadastro. Ela cita o CPF porque o campo da tela e "E-mail ou CPF", e quem
    // entra por CPF nao entenderia um erro que so fala de e-mail.
    //
    // "Credenciais invalidas" era o texto ate 18/09 e nao dizia a quem lia o que
    // fazer em seguida.
    if (!usuario) {
      this.tentativas.registrarErro(identificador);
      throw new UnauthorizedError(CREDENCIAIS_INCORRETAS);
    }

    const senhaCorreta =
      Boolean(usuario.senhaHash) &&
      (await bcrypt.compare(senha, usuario.senhaHash));
    if (!senhaCorreta) {
      this.tentativas.registrarErro(identificador);
      throw new UnauthorizedError(CREDENCIAIS_INCORRETAS);
    }

    // Senha certa zera a contagem mesmo que a conta esteja inativa logo abaixo:
    // quem sabe a senha nao e forca bruta, e deixar a contagem de pe prenderia
    // a pessoa por tentar entrar numa conta que a coordenacao precisa liberar.
    this.tentativas.registrarAcerto(identificador);

    // A conferencia de status vem depois da senha de proposito: assim o login
    // nao vira um consultor de contas para quem nao sabe a senha. Quem acertou
    // a senha e so nao ativou merece saber o motivo — antes recebia
    // "Credenciais invalidas" e ficava tentando trocar a senha a toa.
    if (usuario.status === "pendente_ativacao") {
      throw new UnauthorizedError(
        "Sua conta ainda não foi ativada. Abra o link de ativação enviado para o seu e-mail. Se não recebeu, procure a coordenação do curso para reenviar o link.",
      );
    }

    // Aqui a senha ja conferiu, entao quem esta do outro lado e o dono da conta:
    // dizer que ela esta inativa ou bloqueada nao entrega cadastro de ninguem, e
    // evita que a pessoa fique tentando trocar a senha a toa. Mesmo texto do
    // `validarSessao`, para as duas telas dizerem a mesma coisa.
    if (usuario.status !== "ativo") {
      throw new UnauthorizedError(CONTA_NAO_ATIVA);
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
