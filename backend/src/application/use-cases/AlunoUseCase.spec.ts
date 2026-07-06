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
    mockAlunoRepository = {
      buscarPorEmailOuCpf: jest.fn(),
      buscarPorCpf: jest.fn(),
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
  });

  describe("cadastrar", () => {
    it("deve cadastrar aluno com sucesso", async () => {
      const dados = {
        nome: "Aluno Teste",
        cpf: "123.456.789-00",
        telefone: "(11) 99999-9999",
        email: "teste@email.com",
        dataNascimento: "1990-01-01",
        isAlunoUnipe: false,
        senha: "password123",
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
        cpf: "123.456.789-00",
        telefone: "(11) 99999-9999",
        email: "teste@email.com",
        dataNascimento: "1990-01-01",
        isAlunoUnipe: false,
        senha: "password123",
        treinamento: "teste",
      };
      
      mockAlunoRepository.buscarPorCpf.mockResolvedValue({} as any);

      await expect(alunoUseCase.cadastrar(dados)).rejects.toThrow(BadRequestError);
    });

    it("deve lançar erro se e-mail ja existir", async () => {
      const dados = {
        nome: "Aluno Teste",
        cpf: "123.456.789-00",
        telefone: "(11) 99999-9999",
        email: "teste@email.com",
        dataNascimento: "1990-01-01",
        isAlunoUnipe: false,
        senha: "password123",
        treinamento: "teste",
      };
      
      mockAlunoRepository.buscarPorCpf.mockResolvedValue(null);
      mockAlunoRepository.buscarPorEmail.mockResolvedValue({} as any);

      await expect(alunoUseCase.cadastrar(dados)).rejects.toThrow(BadRequestError);
    });
  });

  describe("redefinirSenha", () => {
    it("deve lançar erro se o token for invalido", async () => {
        (crypto.createHash as jest.Mock).mockReturnValue({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue("hash"),
        });
        mockAlunoRepository.buscarRecuperacaoValidaPorTokenHash.mockResolvedValue(null);

        await expect(alunoUseCase.redefinirSenha("token", "novaSenha123")).rejects.toThrow(BadRequestError);
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
