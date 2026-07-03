import { InstrutorUseCase } from "./InstrutorUseCase";
import { InstrutorRepository } from "../../domain/repositories/InstrutorRepository";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";

describe("InstrutorUseCase", () => {
  let instrutorUseCase: InstrutorUseCase;
  let mockInstrutorRepository: jest.Mocked<InstrutorRepository>;

  beforeEach(() => {
    mockInstrutorRepository = {
      buscarDashboard: jest.fn(),
      turmaPertenceAoInstrutor: jest.fn(),
      registrarPresencas: jest.fn(),
      adicionarMaterial: jest.fn(),
      removerMaterial: jest.fn(),
      adicionarAula: jest.fn(),
      removerAula: jest.fn(),
      buscarPresencasPorAula: jest.fn(),
      atualizarAvatar: jest.fn(),
    } as any;

    instrutorUseCase = new InstrutorUseCase(mockInstrutorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("obterDashboard", () => {
    it("deve retornar o dashboard com sucesso", async () => {
      const mockDashboard = { instrutorId: "1", nome: "Instrutor", turmas: [] };
      mockInstrutorRepository.buscarDashboard.mockResolvedValue(mockDashboard as any);

      const result = await instrutorUseCase.obterDashboard("1");
      expect(result).toEqual(mockDashboard);
    });

    it("deve lançar erro se o ID for vazio", async () => {
      await expect(instrutorUseCase.obterDashboard("")).rejects.toThrow("O ID do instrutor e obrigatorio.");
    });

    it("deve lançar erro se o instrutor não for encontrado", async () => {
      mockInstrutorRepository.buscarDashboard.mockResolvedValue(null);
      await expect(instrutorUseCase.obterDashboard("1")).rejects.toThrow("Instrutor nao encontrado.");
    });
  });

  describe("adicionarMaterial", () => {
    it("deve adicionar material com sucesso", async () => {
      const input = { turmaId: "1", titulo: "Material", tipo: "pdf", tamanhoBytes: 1024 };
      mockInstrutorRepository.adicionarMaterial.mockResolvedValue({ id: "1", ...input } as any);

      const result = await instrutorUseCase.adicionarMaterial(input as any);
      expect(result.titulo).toBe("Material");
    });

    it("deve lançar erro se a turma for vazia", async () => {
      const input = { turmaId: "", titulo: "Material", tipo: "pdf" };
      await expect(instrutorUseCase.adicionarMaterial(input as any)).rejects.toThrow("A turma e obrigatoria.");
    });
  });
});
