import type { CadastroFormData } from "@/schemas/cadastroSchema";

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

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("URL da API nao configurada.");
  }

  return apiUrl.replace(/\/$/, "");
};

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
  const response = await fetch(`${getApiUrl()}/treinamentos/publicos`, {
    cache: "no-store",
  });

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
  const response = await fetch(`${getApiUrl()}/alunos`, {
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

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Erro ao realizar o cadastro."),
    );
  }

  return (await response.json()) as CadastroAlunoResponse;
};
