// ATENCAO: modulo de uso exclusivo do servidor. Ele le cookies de sessao
// e por isso so deve ser importado por Server Components ou Server Actions,
// nunca por componentes "use client".
import { cookies } from "next/headers";
import {
  coordinatorAttendanceMock,
  coordinatorCertificatesMock,
  coordinatorClassMaterialsMock,
  coordinatorLessonsMock,
  coordinatorProcessesMock,
  coordinatorReportsMock,
  coordinatorSettingsMock,
  coordinatorStudentsMock,
  coordinatorUsersMock,
} from "@/mocks/coordinatorMock";
import type {
  AttendanceSummary,
  BaseUser,
  CertificateRecord,
  ClassGroup,
  ClassMaterial,
  CoordinatorDashboardSummary,
  CoordinatorReportData,
  CoordinatorSettings,
  Course,
  Instructor,
  Lesson,
  ProcessRecord,
  Student,
} from "@/types/coordinator";

// MOCK TEMPORARIO: as funcoes abaixo (frequencia, materiais, certificados,
// processos, relatorios, usuarios, configuracoes) ainda nao tem backend e
// continuam retornando mock. Dashboard, cursos, instrutores e turmas ja
// consultam a API real.

interface ApiConfig {
  baseUrl: string;
  token: string;
}

const getApiConfig = async (): Promise<ApiConfig | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("adm4all_token")?.value;

  if (!token) {
    return null;
  }

  return { baseUrl, token };
};

const montarHeaders = (config: ApiConfig): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${config.token}`,
});

const extrairErro = async (response: Response, fallback: string) => {
  try {
    const data = await response.json();
    return data?.erro ?? data?.mensagem ?? fallback;
  } catch {
    return fallback;
  }
};

interface CursoApi {
  id: string;
  nome: string;
  descricao: string | null;
  cargaHoraria: number;
  status: Course["status"];
  quantidadeTurmas: number;
}

interface InstrutorApi {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  status: Instructor["status"];
  turmasVinculadas: number;
  dataCriacao: string;
}

interface TurmaApi {
  id: string;
  nome: string;
  curso: string;
  instrutor: string | null;
  alunos: number;
  dataInicio: string;
  dataTermino: string | null;
  status: ClassGroup["status"];
  frequenciaMedia: number;
}

interface TurmaDetalheApi {
  turma: TurmaApi;
  alunos: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    frequencia: number;
    status: string;
  }[];
  cronograma: {
    id: string;
    numeroAula: number;
    titulo: string;
    data: string;
    status: string;
  }[];
}

const mapearCurso = (curso: CursoApi): Course => ({
  id: curso.id,
  nome: curso.nome,
  descricao: curso.descricao ?? "",
  cargaHoraria: curso.cargaHoraria,
  status: curso.status,
  quantidadeTurmas: curso.quantidadeTurmas,
});

const mapearInstrutor = (instrutor: InstrutorApi): Instructor => ({
  id: instrutor.id,
  nome: instrutor.nome,
  email: instrutor.email,
  telefone: instrutor.telefone ?? undefined,
  status: instrutor.status,
  turmasVinculadas: instrutor.turmasVinculadas,
  dataCriacao: instrutor.dataCriacao,
});

const mapearTurma = (turma: TurmaApi): ClassGroup => ({
  id: turma.id,
  nome: turma.nome,
  curso: turma.curso,
  instrutor: turma.instrutor ?? "",
  alunos: turma.alunos,
  dataInicio: turma.dataInicio,
  dataTermino: turma.dataTermino ?? "",
  status: turma.status,
  frequenciaMedia: turma.frequenciaMedia,
});

export const getDashboardSummary =
  async (): Promise<CoordinatorDashboardSummary> => {
    const config = await getApiConfig();

    if (!config) {
      return {
        totalCursos: 0,
        totalTurmas: 0,
        totalAlunos: 0,
        totalInstrutores: 0,
        frequenciaMedia: 0,
        certificadosPendentes: 0,
        processosAbertos: 0,
        usuariosPendentes: 0,
        relatorios: [],
      };
    }

    const response = await fetch(`${config.baseUrl}/coordenador/dashboard`, {
      headers: montarHeaders(config),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        await extrairErro(response, "Falha ao carregar o painel."),
      );
    }

    const dados = await response.json();

    return { ...dados, relatorios: [] };
  };

export const getCourses = async (): Promise<Course[]> => {
  const config = await getApiConfig();
  if (!config) {
    return [];
  }

  const response = await fetch(`${config.baseUrl}/cursos`, {
    headers: montarHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await extrairErro(response, "Falha ao carregar os cursos."),
    );
  }

  const cursos: CursoApi[] = await response.json();
  return cursos.map(mapearCurso);
};

export const createCourse = async (input: {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  status: Course["status"];
}): Promise<Course> => {
  const config = await getApiConfig();
  if (!config) {
    throw new Error("Faca login como coordenador para cadastrar um curso.");
  }

  const response = await fetch(`${config.baseUrl}/cursos`, {
    method: "POST",
    headers: montarHeaders(config),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await extrairErro(response, "Falha ao cadastrar o curso."));
  }

  return mapearCurso(await response.json());
};

export const getInstructors = async (): Promise<Instructor[]> => {
  const config = await getApiConfig();
  if (!config) {
    return [];
  }

  const response = await fetch(`${config.baseUrl}/instrutores`, {
    headers: montarHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await extrairErro(response, "Falha ao carregar os instrutores."),
    );
  }

  const instrutores: InstrutorApi[] = await response.json();
  return instrutores.map(mapearInstrutor);
};

export const inviteInstructor = async (input: {
  nome: string;
  email: string;
  telefone?: string;
}): Promise<{ id: string; nome: string }> => {
  const config = await getApiConfig();
  if (!config) {
    throw new Error("Faca login como coordenador para convidar um instrutor.");
  }

  const response = await fetch(`${config.baseUrl}/instrutores`, {
    method: "POST",
    headers: montarHeaders(config),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await extrairErro(response, "Falha ao enviar o convite de ativacao."),
    );
  }

  return await response.json();
};

export const getClasses = async (): Promise<ClassGroup[]> => {
  const config = await getApiConfig();
  if (!config) {
    return [];
  }

  const response = await fetch(`${config.baseUrl}/turmas`, {
    headers: montarHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await extrairErro(response, "Falha ao carregar as turmas."),
    );
  }

  const turmas: TurmaApi[] = await response.json();
  return turmas.map(mapearTurma);
};

export const createClass = async (input: {
  curso: string;
  nome: string;
  instrutor: string;
  dataInicio: string;
  dataTermino: string;
  horarios: string;
  limiteAlunos: number;
  status: ClassGroup["status"];
}): Promise<ClassGroup> => {
  const config = await getApiConfig();
  if (!config) {
    throw new Error("Faca login como coordenador para cadastrar uma turma.");
  }

  const response = await fetch(`${config.baseUrl}/turmas`, {
    method: "POST",
    headers: montarHeaders(config),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await extrairErro(response, "Falha ao cadastrar a turma."));
  }

  return mapearTurma(await response.json());
};

const buscarTurmaDetalheApi = async (
  id: string,
): Promise<TurmaDetalheApi | null> => {
  const config = await getApiConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.baseUrl}/turmas/${id}`, {
    headers: montarHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
};

export const getClassById = async (
  id: string,
): Promise<ClassGroup | undefined> => {
  const detalhe = await buscarTurmaDetalheApi(id);
  return detalhe ? mapearTurma(detalhe.turma) : undefined;
};

export const getClassStudentsAndLessons = async (
  id: string,
): Promise<{ students: Student[]; lessons: Lesson[] }> => {
  const detalhe = await buscarTurmaDetalheApi(id);

  if (!detalhe) {
    return { students: [], lessons: [] };
  }

  const students: Student[] = detalhe.alunos.map((aluno) => ({
    id: aluno.id,
    nome: aluno.nome,
    email: aluno.email,
    telefone: aluno.telefone ?? undefined,
    turma: detalhe.turma.nome,
    curso: detalhe.turma.curso,
    frequencia: aluno.frequencia,
    status: aluno.status as Student["status"],
    dataCriacao: "",
  }));

  const lessons: Lesson[] = detalhe.cronograma.map((aula) => ({
    id: aula.id,
    numeroAula: aula.numeroAula,
    titulo: aula.titulo,
    curso: detalhe.turma.curso,
    turma: detalhe.turma.nome,
    instrutor: detalhe.turma.instrutor ?? "",
    data: aula.data,
    status: aula.status as Lesson["status"],
  }));

  return { students, lessons };
};

export const getStudents = async (): Promise<Student[]> => {
  return coordinatorStudentsMock;
};

export const getClassMaterials = async (
  className: string,
): Promise<ClassMaterial[]> => {
  return coordinatorClassMaterialsMock.filter(
    (material) => material.turma === className,
  );
};

export const getAttendanceSummary = async (): Promise<AttendanceSummary[]> => {
  return coordinatorAttendanceMock;
};

export const getLessons = async (): Promise<Lesson[]> => {
  return coordinatorLessonsMock;
};

export const getCertificates = async (): Promise<CertificateRecord[]> => {
  return coordinatorCertificatesMock;
};

export const getProcesses = async (): Promise<ProcessRecord[]> => {
  return coordinatorProcessesMock;
};

export const getReports = async (): Promise<CoordinatorReportData[]> => {
  return coordinatorReportsMock;
};

export const getCoordinatorSettings =
  async (): Promise<CoordinatorSettings> => {
    return coordinatorSettingsMock;
  };

export const getUsers = async (): Promise<BaseUser[]> => {
  return coordinatorUsersMock;
};
