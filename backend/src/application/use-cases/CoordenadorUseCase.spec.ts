import { CoordenadorUseCase } from "./CoordenadorUseCase";
import type { CoordenadorRepository } from "../../domain/repositories/CoordenadorRepository";
import type { ConfiguracoesRepository } from "../../domain/repositories/ConfiguracoesRepository";
import { EmailService } from "../../infrastructure/email/EmailService";
import { ActivationUseCase } from "./ActivationUseCase";
import { BadRequestError } from "../../infrastructure/errors/BadRequestError";

// O repositorio do coordenador tem dezenas de metodos e este arquivo exercita
// so a matricula, entao o mock traz apenas o caminho de vincularAlunoTurma.
const criarUseCase = (repo: Partial<CoordenadorRepository>) =>
  new CoordenadorUseCase(
    repo as CoordenadorRepository,
    {} as unknown as EmailService,
    {} as unknown as ActivationUseCase,
    {} as unknown as ConfiguracoesRepository,
  );

const TURMA_ID = "11111111-1111-4111-8111-111111111111";
const ALUNO_ID = "22222222-2222-4222-8222-222222222222";

const turmaDestino = {
  id: TURMA_ID,
  treinamentoId: "33333333-3333-4333-8333-333333333333",
  status: "planejada",
  capacidade: 30,
  periodoLetivo: "2026.2",
};

const repoBase = (): Partial<CoordenadorRepository> => ({
  buscarTurmaPorId: jest.fn().mockResolvedValue(turmaDestino),
  verificarAlunoExiste: jest.fn().mockResolvedValue(true),
  buscarMatriculaAlunoTurma: jest.fn().mockResolvedValue(null),
  buscarMatriculaAtivaNoTreinamento: jest.fn().mockResolvedValue(null),
  buscarMatriculaNoPeriodo: jest.fn().mockResolvedValue(null),
  contarMatriculasAtivas: jest.fn().mockResolvedValue(0),
  vincularAluno: jest.fn().mockResolvedValue({
    id: "matricula-1",
    alunoId: ALUNO_ID,
    turmaId: TURMA_ID,
    treinamentoId: turmaDestino.treinamentoId,
    status: "em_andamento",
    dataMatricula: "2026-09-18",
  }),
});

// Excluir e bloquear sao decisoes separadas desde 18/09: excluir tira do
// sistema, bloquear impede de voltar. Ate entao excluir fazia as duas, e nao
// havia como apagar um cadastro errado sem barrar a pessoa para sempre.
describe("CoordenadorUseCase — excluir nao bloqueia o CPF", () => {
  it("excluirAluno chama o repositorio so com o id", async () => {
    const repo: Partial<CoordenadorRepository> = {
      excluirAluno: jest.fn().mockResolvedValue({
        nome: "Aluno de Teste",
        email: "aluno@teste.com",
        cpf: "11122233396",
      }),
      sincronizarBloqueioCpfDoAluno: jest.fn(),
    };

    await criarUseCase(repo).excluirAluno(ALUNO_ID);

    expect(repo.excluirAluno).toHaveBeenCalledWith(ALUNO_ID);
    expect(repo.sincronizarBloqueioCpfDoAluno).not.toHaveBeenCalled();
  });

  const alunoAtual = {
    id: ALUNO_ID,
    usuarioId: "55555555-5555-4555-8555-555555555555",
    nome: "Aluno de Teste",
    email: "aluno@teste.com",
    telefone: "83988880001",
  };

  const repoDeAtualizacao = (): Partial<CoordenadorRepository> => ({
    buscarAlunoDetalhe: jest.fn().mockResolvedValue(alunoAtual),
    buscarUsuarioPorEmail: jest.fn().mockResolvedValue(null),
    atualizarAluno: jest.fn().mockResolvedValue(alunoAtual),
    sincronizarBloqueioCpfDoAluno: jest.fn(),
  });

  const dados = (statusConta: string) => ({
    nome: "Aluno de Teste",
    email: "aluno@teste.com",
    telefone: "83988880001",
    statusConta,
  });

  it("o botao Bloquear e quem manda o CPF para a lista", async () => {
    const repo = repoDeAtualizacao();

    await criarUseCase(repo).atualizarAluno(
      ALUNO_ID,
      dados("bloqueado") as never,
      "66666666-6666-4666-8666-666666666666",
    );

    expect(repo.sincronizarBloqueioCpfDoAluno).toHaveBeenCalledWith(
      ALUNO_ID,
      true,
      "66666666-6666-4666-8666-666666666666",
    );
  });

  it("Reativar tira o CPF da lista", async () => {
    const repo = repoDeAtualizacao();

    await criarUseCase(repo).atualizarAluno(ALUNO_ID, dados("ativo") as never);

    expect(repo.sincronizarBloqueioCpfDoAluno).toHaveBeenCalledWith(
      ALUNO_ID,
      false,
      null,
    );
  });
});

describe("CoordenadorUseCase.vincularAlunoTurma", () => {
  it("recusa o aluno que ja esta em outra turma do mesmo periodo", async () => {
    const repo = repoBase();
    repo.buscarMatriculaNoPeriodo = jest.fn().mockResolvedValue({
      id: "matricula-antiga",
      turmaId: "44444444-4444-4444-8444-444444444444",
      turmaNome: "Teste-adm",
      cursoNome: "Assistente Administrativo",
      periodoLetivo: "2026.2",
      status: "aprovado",
    });

    await expect(
      criarUseCase(repo).vincularAlunoTurma(TURMA_ID, ALUNO_ID),
    ).rejects.toThrow(BadRequestError);
    expect(repo.vincularAluno).not.toHaveBeenCalled();
  });

  it("aponta a turma de origem para a coordenacao saber de onde desvincular", async () => {
    const repo = repoBase();
    repo.buscarMatriculaNoPeriodo = jest.fn().mockResolvedValue({
      id: "matricula-antiga",
      turmaId: "44444444-4444-4444-8444-444444444444",
      turmaNome: "Teste-adm",
      cursoNome: "Assistente Administrativo",
      periodoLetivo: "2026.2",
      status: "aprovado",
    });

    await expect(
      criarUseCase(repo).vincularAlunoTurma(TURMA_ID, ALUNO_ID),
    ).rejects.toThrow(/Teste-adm.*Assistente Administrativo.*2026\.2/s);
  });

  it("consulta o periodo da turma de destino, ignorando ela mesma", async () => {
    const repo = repoBase();

    await criarUseCase(repo).vincularAlunoTurma(TURMA_ID, ALUNO_ID);

    expect(repo.buscarMatriculaNoPeriodo).toHaveBeenCalledWith(
      ALUNO_ID,
      "2026.2",
      TURMA_ID,
    );
  });

  it("vincula quando o aluno nao ocupa nenhuma turma do periodo", async () => {
    const repo = repoBase();

    const matricula = await criarUseCase(repo).vincularAlunoTurma(
      TURMA_ID,
      ALUNO_ID,
    );

    expect(matricula.turmaId).toBe(TURMA_ID);
    expect(repo.vincularAluno).toHaveBeenCalledWith({
      alunoId: ALUNO_ID,
      turmaId: TURMA_ID,
      // O curso vem da turma de destino: e dele que o certificado tira o nome
      // do curso quando a coordenacao troca o aluno de turma.
      treinamentoId: turmaDestino.treinamentoId,
    });
  });
});
