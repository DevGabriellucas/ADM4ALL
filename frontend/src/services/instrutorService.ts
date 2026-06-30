// ATENCAO: modulo de uso exclusivo do servidor. Ele le cookies de sessao
// e por isso so deve ser importado por Server Components ou Server Actions,
// nunca por componentes "use client".
import { cookies } from "next/headers";
import { instrutorDashboardMock } from "@/mocks/instrutorDashboardMock";
import type {
  AdicionarAulaInput,
  AdicionarMaterialInput,
  AlunoPresenca,
  AtualizarAvatarInput,
  AulaResumo,
  InstrutorDashboard,
  MaterialResumo,
  RegistrarPresencasInput,
} from "@/types/instrutor";

const INSTRUTOR_ID_DEMO =
  process.env.INSTRUTOR_ID ?? "20000000-0000-0000-0000-000000000001";

interface ApiConfig {
  baseUrl: string;
  token: string;
  instrutorId: string;
}

const getApiConfig = async (): Promise<ApiConfig | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("adm4all_token")?.value;
  const instrutorId =
    cookieStore.get("adm4all_instrutor_id")?.value ?? process.env.INSTRUTOR_ID;

  if (!token || !instrutorId) {
    return null;
  }

  return { baseUrl, token, instrutorId };
};

const montarHeaders = (config: ApiConfig): HeadersInit => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.token}`,
  };
};

const extrairErro = async (response: Response, fallback: string) => {
  try {
    const data = await response.json();
    return data?.erro ?? data?.mensagem ?? fallback;
  } catch {
    return fallback;
  }
};

export const getInstrutorDashboard = async (): Promise<InstrutorDashboard> => {
  const config = await getApiConfig();

  // Sem API configurada caimos no mock, assim a tela renderiza em
  // desenvolvimento mesmo sem o backend no ar (igual a tela do aluno).
  if (!config) {
    return instrutorDashboardMock;
  }

  try {
    const response = await fetch(
      `${config.baseUrl}/instrutores/${config.instrutorId ?? INSTRUTOR_ID_DEMO}/dashboard`,
      {
        headers: montarHeaders(config),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`A API respondeu com status ${response.status}.`);
    }

    return (await response.json()) as InstrutorDashboard;
  } catch (error) {
    console.warn(
      "[instrutorService] usando dados mockados; falha ao consultar a API:",
      error,
    );
    return instrutorDashboardMock;
  }
};

export const registrarPresencas = async (
  input: RegistrarPresencasInput,
): Promise<void> => {
  const config = await getApiConfig();

  if (!config) {
    throw new Error("Faca login como instrutor para salvar a presenca.");
  }

  const response = await fetch(
    `${config.baseUrl}/turmas/${input.turmaId}/presencas`,
    {
      method: "POST",
      headers: montarHeaders(config),
      body: JSON.stringify({
        aulaId: input.aulaId,
        registros: input.registros,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await extrairErro(response, "Falha ao registrar a presenca."),
    );
  }
};

export const adicionarMaterial = async (
  input: AdicionarMaterialInput,
): Promise<MaterialResumo> => {
  const config = await getApiConfig();

  if (!config) {
    throw new Error("Faca login como instrutor para adicionar materiais.");
  }

  const response = await fetch(
    `${config.baseUrl}/turmas/${input.turmaId}/materiais`,
    {
      method: "POST",
      headers: montarHeaders(config),
      body: JSON.stringify({
        titulo: input.titulo,
        tipo: input.tipo,
        urlArquivo: input.urlArquivo ?? null,
        tamanhoBytes: input.tamanhoBytes ?? null,
        publicadoPorId: input.publicadoPorId ?? null,
        arquivo: input.arquivo ?? null,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await extrairErro(response, "Falha ao adicionar o material."),
    );
  }

  return (await response.json()) as MaterialResumo;
};

export const removerMaterial = async (
  turmaId: string,
  materialId: string,
): Promise<void> => {
  const config = await getApiConfig();

  if (!config) {
    throw new Error("Faca login como instrutor para remover materiais.");
  }

  const response = await fetch(
    `${config.baseUrl}/turmas/${turmaId}/materiais/${materialId}`,
    {
      method: "DELETE",
      headers: montarHeaders(config),
    },
  );

  if (!response.ok) {
    throw new Error(
      await extrairErro(response, "Falha ao remover o material."),
    );
  }
};

export const adicionarAula = async (
  input: AdicionarAulaInput,
): Promise<AulaResumo> => {
  const config = await getApiConfig();

  if (!config) {
    throw new Error("Faca login como instrutor para adicionar aulas.");
  }

  const response = await fetch(
    `${config.baseUrl}/turmas/${input.turmaId}/aulas`,
    {
      method: "POST",
      headers: montarHeaders(config),
      body: JSON.stringify({
        titulo: input.titulo,
        data: input.data,
        horaInicio: input.horaInicio ?? null,
        horaFim: input.horaFim ?? null,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await extrairErro(response, "Falha ao adicionar a aula."));
  }

  return (await response.json()) as AulaResumo;
};

export const removerAula = async (
  turmaId: string,
  aulaId: string,
): Promise<void> => {
  const config = await getApiConfig();

  if (!config) {
    throw new Error("Faca login como instrutor para remover aulas.");
  }

  const response = await fetch(
    `${config.baseUrl}/turmas/${turmaId}/aulas/${aulaId}`,
    {
      method: "DELETE",
      headers: montarHeaders(config),
    },
  );

  if (!response.ok) {
    throw new Error(await extrairErro(response, "Falha ao remover a aula."));
  }
};

export const getPresencasPorAula = async (
  turmaId: string,
  aulaId: string,
): Promise<AlunoPresenca[]> => {
  const config = await getApiConfig();

  if (!config) {
    throw new Error("Faca login como instrutor para consultar a presenca.");
  }

  const response = await fetch(
    `${config.baseUrl}/turmas/${turmaId}/aulas/${aulaId}/presencas`,
    {
      headers: montarHeaders(config),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await extrairErro(response, "Falha ao consultar a presenca da aula."),
    );
  }

  const data = (await response.json()) as { alunos: AlunoPresenca[] };
  return data.alunos;
};

export const atualizarAvatarInstrutor = async (
  input: AtualizarAvatarInput,
): Promise<string> => {
  const config = await getApiConfig();

  if (!config) {
    throw new Error("Faca login como instrutor para atualizar a foto.");
  }

  const response = await fetch(
    `${config.baseUrl}/instrutores/${input.instrutorId}/avatar`,
    {
      method: "POST",
      headers: montarHeaders(config),
      body: JSON.stringify({ arquivo: input.arquivo }),
    },
  );

  if (!response.ok) {
    throw new Error(await extrairErro(response, "Falha ao atualizar a foto."));
  }

  const data = (await response.json()) as { avatarUrl: string };
  return data.avatarUrl;
};
