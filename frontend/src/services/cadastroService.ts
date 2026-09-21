import type { CadastroFormData } from "@/schemas/cadastroSchema";
import { getPublicApiUrl } from "@/services/apiUrl";
import { SERVER_UNAVAILABLE_MESSAGE } from "@/utils/getErrorMessage";

export interface TreinamentoPublico {
  id: string;
  nome: string;
  descricao: string | null;
  cargaHoraria: number;
}

export interface CadastroAlunoResponse {
  id: string;
  nome: string;
  mensagem: string;
  emailEnviado?: boolean;
  linkAtivacao?: string;
}

interface ApiErrorResponse {
  erro?: string;
  mensagem?: string;
}

const readApiError = async (response: Response, fallback: string) => {
  try {
    const error = (await response.json()) as ApiErrorResponse;
    return error.erro ?? error.mensagem ?? fallback;
  } catch {
    return fallback;
  }
};

export const listarTreinamentosPublicos = async (): Promise<
  TreinamentoPublico[]
> => {
  let response: Response;

  try {
    response = await fetch(`${getPublicApiUrl()}/treinamentos/publicos`, {
      cache: "no-store",
    });
  } catch {
    // Quem le esta tela e um candidato, nao quem mantem o sistema: "verifique
    // se o backend esta rodando" nao e instrucao que ele possa seguir.
    throw new Error(SERVER_UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "Nao foi possivel carregar os treinamentos.",
      ),
    );
  }

  return (await response.json()) as TreinamentoPublico[];
};

export const cadastrarAluno = async (
  data: CadastroFormData,
): Promise<CadastroAlunoResponse> => {
  let response: Response;

  try {
    response = await fetch(`${getPublicApiUrl()}/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email,
        dataNascimento: data.dataNascimento,
        isAlunoUnipe: data.isAlunoUnipe,
        cursoUnipe: data.isAlunoUnipe ? data.cursoUnipe : undefined,
        senha: data.senha,
        treinamento: data.treinamento,
        rgm: data.isAlunoUnipe ? data.rgm : undefined,
      }),
    });
  } catch {
    throw new Error(SERVER_UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Erro ao realizar o cadastro."),
    );
  }

  return (await response.json()) as CadastroAlunoResponse;
};
