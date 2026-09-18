import { InstrutorUseCase } from "./InstrutorUseCase";
import { InstrutorRepository } from "../../domain/repositories/InstrutorRepository";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";

describe("InstrutorUseCase", () => {
  let instrutorUseCase: InstrutorUseCase;
  let mockInstrutorRepository: jest.Mocked<InstrutorRepository>;
  let mockEmailService: { enviar: jest.Mock };

  beforeEach(() => {
    mockInstrutorRepository = {
      buscarDashboard: jest.fn(),
      buscarDashboardDaTurma: jest.fn(),
      listarMateriaisTurma: jest.fn(),
      turmaPertenceAoInstrutor: jest.fn(),
      registrarPresencas: jest.fn(),
      adicionarMaterial: jest.fn(),
      removerMaterial: jest.fn(),
      atualizarMaterialVisibilidade: jest.fn(),
      adicionarAula: jest.fn(),
      buscarAulaParaNotificacao: jest.fn(),
      listarAlunosParaNotificacaoAula: jest.fn(),
      atualizarAula: jest.fn(),
      removerAula: jest.fn(),
      buscarPresencasPorAula: jest.fn(),
      atualizarAvatar: jest.fn(),
    } as any;

    mockEmailService = {
      enviar: jest.fn().mockResolvedValue(undefined),
    };

    instrutorUseCase = new InstrutorUseCase(
      mockInstrutorRepository,
      mockEmailService,
    );
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

  describe("obterDashboardDaTurma", () => {
    it("deve retornar o painel da turma escolhida", async () => {
      const mockPainel = { turma: { id: "t1" }, alunos: [], cronograma: [] };
      mockInstrutorRepository.buscarDashboardDaTurma.mockResolvedValue(
        mockPainel as any,
      );

      const result = await instrutorUseCase.obterDashboardDaTurma("t1");

      expect(mockInstrutorRepository.buscarDashboardDaTurma).toHaveBeenCalledWith("t1");
      expect(result).toEqual(mockPainel);
    });

    it("deve lançar erro se a turma for vazia", async () => {
      await expect(instrutorUseCase.obterDashboardDaTurma("  ")).rejects.toThrow(
        BadRequestError,
      );
    });

    it("deve lançar 404 se a turma não existir", async () => {
      mockInstrutorRepository.buscarDashboardDaTurma.mockResolvedValue(null);

      await expect(instrutorUseCase.obterDashboardDaTurma("t1")).rejects.toThrow(
        "Turma nao encontrada.",
      );
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

  // 2026-09-12 e um sabado; 2026-09-10, uma quinta. Ver DIA_DA_SEMANA_DAS_AULAS.
  describe("adicionarAula", () => {
    const aulaValida = {
      turmaId: "turma-1",
      titulo: "Aula 1",
      data: "2026-09-12",
      horaInicio: "08:00",
      horaFim: "12:00",
    };

    it("aceita aula marcada num sabado", async () => {
      mockInstrutorRepository.adicionarAula.mockResolvedValue({
        id: "aula-1",
        numero: 1,
        titulo: "Aula 1",
        data: "2026-09-12",
        horaInicio: "08:00",
        horaFim: "12:00",
        status: "planejada",
      });

      await instrutorUseCase.adicionarAula(aulaValida);

      expect(mockInstrutorRepository.adicionarAula).toHaveBeenCalled();
    });

    it("recusa aula marcada fora de sabado e diz em que dia caiu", async () => {
      await expect(
        instrutorUseCase.adicionarAula({ ...aulaValida, data: "2026-09-10" }),
      ).rejects.toThrow("As aulas acontecem aos sabados. 2026-09-10 cai numa quinta-feira.");
      expect(mockInstrutorRepository.adicionarAula).not.toHaveBeenCalled();
    });

    // O fuso e a armadilha: lido no horario local de UTC-3, um sabado em UTC
    // vira a sexta anterior e a regra recusaria toda data valida.
    it("nao deixa o fuso do servidor mover o dia da semana", async () => {
      const tz = process.env.TZ;
      process.env.TZ = "America/Sao_Paulo";

      mockInstrutorRepository.adicionarAula.mockResolvedValue({
        id: "aula-1",
        numero: 1,
        titulo: "Aula 1",
        data: "2026-09-12",
        horaInicio: "08:00",
        horaFim: "12:00",
        status: "planejada",
      });

      await expect(
        instrutorUseCase.adicionarAula(aulaValida),
      ).resolves.toBeDefined();

      process.env.TZ = tz;
    });
  });

  describe("atualizarAula", () => {
    it("recusa remarcar uma aula para fora de sabado", async () => {
      await expect(
        instrutorUseCase.atualizarAula({
          turmaId: "turma-1",
          aulaId: "aula-1",
          data: "2026-09-10",
        }),
      ).rejects.toThrow(BadRequestError);
      expect(mockInstrutorRepository.atualizarAula).not.toHaveBeenCalled();
    });

    it("deve notificar alunos ativos quando uma aula for cancelada", async () => {
      mockInstrutorRepository.buscarAulaParaNotificacao.mockResolvedValue({
        id: "aula-1",
        turmaId: "turma-1",
        numero: 1,
        titulo: "Aula de contratos",
        data: "2026-07-08",
        horaInicio: null,
        horaFim: null,
        status: "planejada",
        turma: "ADM 2026.1",
        curso: "Assistente Administrativo",
      });
      mockInstrutorRepository.atualizarAula.mockResolvedValue({
        id: "aula-1",
        numero: 1,
        titulo: "Aula de contratos",
        data: "2026-07-08",
        horaInicio: null,
        horaFim: null,
        status: "cancelada",
      });
      mockInstrutorRepository.listarAlunosParaNotificacaoAula.mockResolvedValue([
        {
          alunoId: "aluno-1",
          nome: "Ana Silva",
          email: "ana@example.com",
        },
        {
          alunoId: "aluno-2",
          nome: "Bruno Lima",
          email: "bruno@example.com",
        },
      ]);

      await instrutorUseCase.atualizarAula({
        turmaId: "turma-1",
        aulaId: "aula-1",
        status: "cancelada",
      });

      expect(
        mockInstrutorRepository.listarAlunosParaNotificacaoAula,
      ).toHaveBeenCalledWith("turma-1");
      expect(mockEmailService.enviar).toHaveBeenCalledTimes(2);
      expect(mockEmailService.enviar).toHaveBeenCalledWith(
        "ana@example.com",
        "Aula cancelada - Aula de contratos",
        expect.stringContaining("A aula abaixo foi cancelada"),
      );
    });

    it("nao deve reenviar notificacao se a aula ja estava cancelada", async () => {
      mockInstrutorRepository.buscarAulaParaNotificacao.mockResolvedValue({
        id: "aula-1",
        turmaId: "turma-1",
        numero: 1,
        titulo: "Aula de contratos",
        data: "2026-07-08",
        horaInicio: null,
        horaFim: null,
        status: "cancelada",
        turma: "ADM 2026.1",
        curso: "Assistente Administrativo",
      });
      mockInstrutorRepository.atualizarAula.mockResolvedValue({
        id: "aula-1",
        numero: 1,
        titulo: "Aula de contratos",
        data: "2026-07-08",
        horaInicio: null,
        horaFim: null,
        status: "cancelada",
      });

      await instrutorUseCase.atualizarAula({
        turmaId: "turma-1",
        aulaId: "aula-1",
        status: "cancelada",
      });

      expect(
        mockInstrutorRepository.listarAlunosParaNotificacaoAula,
      ).not.toHaveBeenCalled();
      expect(mockEmailService.enviar).not.toHaveBeenCalled();
    });
  });
});
