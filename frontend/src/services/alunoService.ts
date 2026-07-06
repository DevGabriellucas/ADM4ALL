import { authenticatedRequest } from "@/services/apiClient";
import type {
  AlunoDashboard,
  AlunoDashboardResponse,
  MateriaisVisiveisAlunoResponse,
  MaterialVisivelAluno,
} from "@/types/aluno";

export const getAlunoDashboard = async (): Promise<AlunoDashboard> => {
  const resposta = await authenticatedRequest<AlunoDashboardResponse>(
    "/alunos/me/dashboard",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar o painel do aluno.",
    },
  );

  return {
    nome: resposta.nome,
    matricula: resposta.matricula,
    curso: resposta.cursoDeExtensao.nomeCurso,
    faltas: resposta.cursoDeExtensao.qtdFaltas,
    aulasPlanejadas: resposta.cursoDeExtensao.qtdTotalAulas,
    aulasConcluidas: resposta.cursoDeExtensao.qtdAulasConcluidas,
    progresso: resposta.cursoDeExtensao.progresso,
    status: resposta.cursoDeExtensao.status,
    certificadoDisponivel: resposta.certificadoDisponivel,
    certificadoUrl: resposta.certificadoUrl,
  };
};

export const getMateriaisVisiveisAluno = async (): Promise<
  MaterialVisivelAluno[]
> => {
  const resposta = await authenticatedRequest<MateriaisVisiveisAlunoResponse>(
    "/alunos/me/materiais",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar os materiais da turma.",
    },
  );

  return Array.isArray(resposta.materiais) ? resposta.materiais : [];
};
