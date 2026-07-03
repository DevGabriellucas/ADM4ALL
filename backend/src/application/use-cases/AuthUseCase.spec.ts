import bcrypt from "bcrypt";
import { AuthUseCase } from "./AuthUseCase";
import { AuthRepository, UsuarioAutenticacao } from "../../domain/repositories/AuthRepository";
import { JwtService } from "../security/JwtService";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { UnauthorizedError } from "../../infrastructure/errors/UnauthorizedError";

jest.mock("bcrypt");

describe("AuthUseCase", () => {
  let authUseCase: AuthUseCase;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockAuthRepository = {
      buscarUsuarioPorIdentificador: jest.fn(),
      registrarUltimoLogin: jest.fn(),
    };
    mockJwtService = {
      gerar: jest.fn(),
      verificar: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    authUseCase = new AuthUseCase(mockAuthRepository, mockJwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve realizar login com sucesso (Happy Path)", async () => {
    // Arrange
    const usuario: UsuarioAutenticacao = {
      id: "1",
      nome: "Joao",
      email: "joao@email.com",
      senhaHash: "hash",
      status: "ativo",
      perfil: "aluno",
      alunoId: "a1",
      instrutorId: null,
      coordenadorId: null,
    };
    mockAuthRepository.buscarUsuarioPorIdentificador.mockResolvedValue(usuario);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.gerar.mockReturnValue("token-jwt");

    // Act
    const resultado = await authUseCase.login("joao@email.com", "senha123");

    // Assert
    expect(resultado.mensagem).toBe("Login realizado com sucesso!");
    expect(resultado.token).toBe("token-jwt");
    expect(resultado.usuario.id).toBe("1");
    expect(resultado.aluno).toEqual({ id: "a1", nome: "Joao" });
    expect(mockAuthRepository.registrarUltimoLogin).toHaveBeenCalledWith("1");
  });

  it("deve lançar BadRequestError se identificador ou senha estiverem ausentes", async () => {
    await expect(authUseCase.login("", "senha")).rejects.toThrow(BadRequestError);
    await expect(authUseCase.login("email", "")).rejects.toThrow(BadRequestError);
  });

  it("deve lançar UnauthorizedError se o usuário não for encontrado", async () => {
    mockAuthRepository.buscarUsuarioPorIdentificador.mockResolvedValue(null);

    await expect(authUseCase.login("naoexiste", "senha")).rejects.toThrow(UnauthorizedError);
  });

  it("deve lançar UnauthorizedError se o usuário estiver inativo", async () => {
    const usuario: UsuarioAutenticacao = {
      id: "1",
      nome: "Joao",
      email: "joao@email.com",
      senhaHash: "hash",
      status: "inativo",
      perfil: "aluno",
      alunoId: "a1",
      instrutorId: null,
      coordenadorId: null,
    };
    mockAuthRepository.buscarUsuarioPorIdentificador.mockResolvedValue(usuario);

    await expect(authUseCase.login("joao@email.com", "senha")).rejects.toThrow(UnauthorizedError);
  });

  it("deve lançar UnauthorizedError se a senha estiver incorreta", async () => {
    const usuario: UsuarioAutenticacao = {
      id: "1",
      nome: "Joao",
      email: "joao@email.com",
      senhaHash: "hash",
      status: "ativo",
      perfil: "aluno",
      alunoId: "a1",
      instrutorId: null,
      coordenadorId: null,
    };
    mockAuthRepository.buscarUsuarioPorIdentificador.mockResolvedValue(usuario);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(authUseCase.login("joao@email.com", "senhaerrada")).rejects.toThrow(UnauthorizedError);
  });
});
