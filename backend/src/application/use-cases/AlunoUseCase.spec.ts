import bcrypt from "bcrypt";
import crypto from "crypto";
import { AlunoUseCase } from "./AlunoUseCase";
import { ActivationUseCase } from "./ActivationUseCase";
import {
  AlunoRepository,
  MaterialAluno,
} from "../../domain/repositories/AlunoRepository";
import { EmailService } from "../../infrastructure/email/EmailService";
import { Aluno } from "../../domain/entities/Aluno";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";
import { UnauthorizedError } from "../../infrastructure/errors/UnauthorizedError";

jest.mock("bcrypt");
jest.mock("crypto");

describe("AlunoUseCase", () => {
  let alunoUseCase: AlunoUseCase;
  let mockAlunoRepository: jest.Mocked<AlunoRepository>;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockActivationUseCase: jest.Mocked<ActivationUseCase>;

  beforeEach(() => {
    process.env.FRONTEND_URL = "https://app.test";

    mockAlunoRepository = {
      buscarPorCpf: jest.fn(),
      cpfBloqueado: jest.fn().mockResolvedValue(false),
      buscarPorEmail: jest.fn(),
      cadastrar: jest.fn(),
      listarTodos: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      buscarUsuarioPorEmail: jest.fn(),
      existeRecuperacaoSenhaRecente: jest.fn(),
      registrarRecuperacaoSenha: jest.fn(),
      buscarRecuperacaoValidaPorTokenHash: jest.fn(),
      redefinirSenhaUsuario: jest.fn(),
      buscarUsuarioIdPorAlunoId: jest.fn(),
      buscarDashboardPorAlunoId: jest.fn(),
      listarMateriaisVisiveisPorAluno: jest.fn(),
      buscarMaterialVisivelParaDownload: jest.fn(),
      buscarCertificadoEmitidoPorAlunoId: jest.fn(),
      atualizarUrlArquivoCertificado: jest.fn(),
      listarMateriaisVisiveis: jest.fn(),
    };
    mockEmailService = {
      enviar: jest.fn(),
    } as unknown as jest.Mocked<EmailService>;
    mockActivationUseCase = {
      criar: jest.fn(),
    } as unknown as jest.Mocked<ActivationUseCase>;

    alunoUseCase = new AlunoUseCase(
      mockAlunoRepository,
      mockEmailService,
      mockActivationUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.FRONTEND_URL;
  });

  describe("cadastrar", () => {
    it("deve cadastrar aluno com sucesso", async () => {
      const dados = {
        nome: "Aluno Teste",
        cpf: "123.456.789-09",
        telefone: "(11) 99999-9999",
        email: "teste@email.com",
        dataNascimento: "1990-01-01",
        isAlunoUnipe: false,
        senha: "Password123!",
        treinamento: "teste",
      };
      
      mockAlunoRepository.buscarPorCpf.mockResolvedValue(null);
      mockAlunoRepository.buscarPorEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      mockAlunoRepository.cadastrar.mockImplementation(async (aluno) => aluno);
      mockAlunoRepository.buscarUsuarioIdPorAlunoId.mockResolvedValue(
        "usuario-id",
      );
      mockActivationUseCase.criar.mockResolvedValue("token-ativacao");

      const result = await alunoUseCase.cadastrar(dados);
      expect(result).toBeDefined();
      expect(mockAlunoRepository.cadastrar).toHaveBeenCalled();
    });

    it("deve lançar erro se CPF ja existir", async () => {
      const dados = {
        nome: "Aluno Teste",
        cpf: "123.456.789-09",
        telefone: "(11) 99999-9999",
        email: "teste@email.com",
        dataNascimento: "1990-01-01",
        isAlunoUnipe: false,
        senha: "Password123!",
        treinamento: "teste",
      };
      
      mockAlunoRepository.buscarPorCpf.mockResolvedValue({} as any);

      await expect(alunoUseCase.cadastrar(dados)).rejects.toThrow(BadRequestError);
    });

    it("deve lançar erro se e-mail ja existir", async () => {
      const dados = {
        nome: "Aluno Teste",
        cpf: "123.456.789-09",
        telefone: "(11) 99999-9999",
        email: "teste@email.com",
        dataNascimento: "1990-01-01",
        isAlunoUnipe: false,
        senha: "Password123!",
        treinamento: "teste",
      };
      
      mockAlunoRepository.buscarPorCpf.mockResolvedValue(null);
      mockAlunoRepository.buscarPorEmail.mockResolvedValue({} as any);

      await expect(alunoUseCase.cadastrar(dados)).rejects.toThrow(BadRequestError);
    });

    it("deve recusar CPF bloqueado antes de qualquer outra checagem", async () => {
      const dados = {
        nome: "Aluno Teste",
        cpf: "123.456.789-09",
        telefone: "(11) 99999-9999",
        email: "teste@email.com",
        dataNascimento: "1990-01-01",
        isAlunoUnipe: false,
        senha: "Password123!",
        treinamento: "teste",
      };

      mockAlunoRepository.cpfBloqueado.mockResolvedValue(true);

      await expect(alunoUseCase.cadastrar(dados)).rejects.toThrow(
        "Você está bloqueado e não conseguirá criar uma conta!!! Entre em contato com a coordenação do curso.",
      );
      expect(mockAlunoRepository.buscarPorCpf).not.toHaveBeenCalled();
      expect(mockAlunoRepository.cadastrar).not.toHaveBeenCalled();
    });
  });

  describe("redefinirSenha", () => {
    const SENHA_FORTE = "NovaSenha#2026";

    const mockarHashDoToken = () => {
      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hash"),
      });
    };

    it("deve lançar erro se o token for invalido", async () => {
      mockarHashDoToken();
      mockAlunoRepository.buscarRecuperacaoValidaPorTokenHash.mockResolvedValue(null);

      await expect(
        alunoUseCase.redefinirSenha("token", SENHA_FORTE),
      ).rejects.toThrow(BadRequestError);
    });

    it("deve recusar a senha que o usuario ja usa", async () => {
      mockarHashDoToken();
      mockAlunoRepository.buscarRecuperacaoValidaPorTokenHash.mockResolvedValue({
        recuperacaoId: "recuperacao-1",
        usuarioId: "usuario-1",
        senhaHashAtual: "hash-da-senha-atual",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        alunoUseCase.redefinirSenha("token", SENHA_FORTE),
      ).rejects.toThrow("A nova senha precisa ser diferente da senha atual.");
      expect(mockAlunoRepository.redefinirSenhaUsuario).not.toHaveBeenCalled();
    });

    it("deve trocar a senha quando ela e diferente da atual", async () => {
      mockarHashDoToken();
      mockAlunoRepository.buscarRecuperacaoValidaPorTokenHash.mockResolvedValue({
        recuperacaoId: "recuperacao-1",
        usuarioId: "usuario-1",
        senhaHashAtual: "hash-da-senha-atual",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hash-da-senha-nova");

      await alunoUseCase.redefinirSenha("token", SENHA_FORTE);

      expect(mockAlunoRepository.redefinirSenhaUsuario).toHaveBeenCalledWith(
        "usuario-1",
        "hash-da-senha-nova",
        "recuperacao-1",
      );
    });

    it("deve cobrar as regras de senha forte antes de olhar o token", async () => {
      mockarHashDoToken();

      await expect(alunoUseCase.redefinirSenha("token", "12345678")).rejects.toThrow(
        BadRequestError,
      );
      expect(
        mockAlunoRepository.buscarRecuperacaoValidaPorTokenHash,
      ).not.toHaveBeenCalled();
    });
  });

  describe("listarMateriais", () => {
    const materiaisMock: MaterialAluno[] = [
      {
        id: "material-1",
        titulo: "Aula 1 - Introducao",
        tipo: "pdf",
        urlArquivo: "/uploads/materiais/aula1.pdf",
        turmaId: "turma-a",
        turmaNome: "Turma A",
        criadoEm: new Date("2025-01-15"),
      },
      {
        id: "material-2",
        titulo: "Aula 2 - Avancado",
        tipo: "video",
        urlArquivo: "/uploads/materiais/aula2.mp4",
        turmaId: "turma-a",
        turmaNome: "Turma A",
        criadoEm: new Date("2025-02-20"),
      },
    ];

    it("deve retornar materiais viaveis para o aluno", async () => {
      mockAlunoRepository.listarMateriaisVisiveisPorAluno.mockResolvedValue(
        materiaisMock,
      );

      const resultado = await alunoUseCase.listarMateriais("aluno-1");

      expect(resultado).toHaveLength(2);
      expect(resultado[0].titulo).toBe("Aula 1 - Introducao");
      expect(
        mockAlunoRepository.listarMateriaisVisiveisPorAluno,
      ).toHaveBeenCalledWith("aluno-1");
    });

    it("deve retornar lista vazia quando aluno nao possui materiais", async () => {
      mockAlunoRepository.listarMateriaisVisiveisPorAluno.mockResolvedValue(
        [],
      );

      const resultado = await alunoUseCase.listarMateriais("aluno-sem-material");

      expect(resultado).toHaveLength(0);
    });

    it("deve retornar lista vazia quando aluno nao possui matricula", async () => {
      mockAlunoRepository.listarMateriaisVisiveisPorAluno.mockResolvedValue(
        [],
      );

      const resultado = await alunoUseCase.listarMateriais(
        "aluno-sem-matricula",
      );

      expect(resultado).toHaveLength(0);
    });

    it("nao deve lancar erro para aluno sem matricula", async () => {
      mockAlunoRepository.listarMateriaisVisiveisPorAluno.mockResolvedValue(
        [],
      );

      await expect(
        alunoUseCase.listarMateriais("aluno-sem-matricula"),
      ).resolves.toEqual([]);
    });
  });
});
