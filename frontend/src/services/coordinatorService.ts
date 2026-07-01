// ATENCAO: modulo de uso exclusivo do servidor. Ele le cookies de sessao
// e por isso so deve ser importado por Server Components ou Server Actions,
// nunca por componentes "use client".
import { isMatriculaStatus } from "@/constants/matriculaStatus";
import {
  coordinatorAttendanceMock,
  coordinatorCertificatesMock,
  coordinatorClassMaterialsMock,
  coordinatorLessonsMock,
  coordinatorProcessesMock,
  coordinatorReportsMock,
  coordinatorSettingsMock,
  coordinatorUsersMock,
} from "@/mocks/coordinatorMock";
import { ApiError, authenticatedRequest } from "@/services/apiClient";
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
  StudentDetail,
  UserStatus,
} from "@/types/coordinator";

// MOCK TEMPORARIO: as funcoes abaixo (frequencia, materiais, certificados,
// processos, relatorios, usuarios, configuracoes) ainda nao tem backend e
// continuam retornando mock. Dashboard, cursos, instrutores, alunos e turmas
// ja consultam a API real.

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

interface AlunoListagemApi {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  turma: string | null;
  curso: string | null;
  frequencia: number;
  statusConta: UserStatus;
  statusMatricula: string | null;
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
  status: string;
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

const normalizeClassStatus = (status: string): ClassGroup["status"] => {
  const normalizedStatus = status === "encerrada" ? "concluida" : status;

  if (
    normalizedStatus === "planejada" ||
    normalizedStatus === "em_andamento" ||
    normalizedStatus === "concluida" ||
    normalizedStatus === "cancelada"
  ) {
    return normalizedStatus;
  }

  throw new Error(`Status de turma inválido recebido: ${status}.`);
};

const serializeClassStatus = (status: ClassGroup["status"]): string =>
  status === "concluida" ? "encerrada" : status;

const mapearTurma = (turma: TurmaApi): ClassGroup => ({
  id: turma.id,
  nome: turma.nome,
  curso: turma.curso,
  instrutor: turma.instrutor ?? "",
  alunos: turma.alunos,
  dataInicio: turma.dataInicio,
  dataTermino: turma.dataTermino ?? "",
  status: normalizeClassStatus(turma.status),
  frequenciaMedia: turma.frequenciaMedia,
});

export const getDashboardSummary =
  async (): Promise<CoordinatorDashboardSummary> => {
    const dados = await authenticatedRequest<
      Omit<CoordinatorDashboardSummary, "relatorios">
    >("/coordenador/dashboard", {
      cache: "no-store",
      fallbackError: "Falha ao carregar o painel.",
    });

    return { ...dados, relatorios: [] };
  };

export const getCourses = async (): Promise<Course[]> => {
  const cursos = await authenticatedRequest<CursoApi[]>("/cursos", {
    cache: "no-store",
    fallbackError: "Falha ao carregar os cursos.",
  });

  return cursos.map(mapearCurso);
};

export const createCourse = async (input: {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  status: Course["status"];
}): Promise<Course> => {
  const curso = await authenticatedRequest<CursoApi>("/cursos", {
    method: "POST",
    body: JSON.stringify(input),
    fallbackError: "Falha ao cadastrar o curso.",
  });

  return mapearCurso(curso);
};

export const getInstructors = async (): Promise<Instructor[]> => {
  const instrutores = await authenticatedRequest<InstrutorApi[]>(
    "/instrutores",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar os instrutores.",
    },
  );

  return instrutores.map(mapearInstrutor);
};

export const inviteInstructor = async (input: {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
}): Promise<{ id: string; nome: string }> => {
  return await authenticatedRequest<{ id: string; nome: string }>(
    "/instrutores",
    {
      method: "POST",
      body: JSON.stringify(input),
      fallbackError: "Falha ao enviar o convite de ativacao.",
    },
  );
};

export const inviteStudent = async (input: {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  dataNascimento: string;
  curso: string;
  turma: string;
}): Promise<{ id: string; nome: string }> => {
  return await authenticatedRequest<{ id: string; nome: string }>(
    "/alunos/convites",
    {
      method: "POST",
      body: JSON.stringify(input),
      fallbackError: "Falha ao enviar o convite de ativacao.",
    },
  );
};

export const getClasses = async (): Promise<ClassGroup[]> => {
  const turmas = await authenticatedRequest<TurmaApi[]>("/turmas", {
    cache: "no-store",
    fallbackError: "Falha ao carregar as turmas.",
  });

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
  const turma = await authenticatedRequest<TurmaApi>("/turmas", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      status: serializeClassStatus(input.status),
    }),
    fallbackError: "Falha ao cadastrar a turma.",
  });

  return mapearTurma(turma);
};

const buscarTurmaDetalheApi = async (
  id: string,
): Promise<TurmaDetalheApi | null> => {
  try {
    return await authenticatedRequest<TurmaDetalheApi>(`/turmas/${id}`, {
      cache: "no-store",
      fallbackError: "Falha ao carregar os detalhes da turma.",
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 400 || error.status === 404)
    ) {
      return null;
    }

    throw error;
  }
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

  const students: Student[] = detalhe.alunos.map((aluno) => {
    if (!isMatriculaStatus(aluno.status)) {
      throw new Error(
        `Status de matrícula inválido recebido para ${aluno.nome}.`,
      );
    }

    return {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      telefone: aluno.telefone ?? undefined,
      turma: detalhe.turma.nome,
      curso: detalhe.turma.curso,
      frequencia: aluno.frequencia,
      statusConta: null,
      statusMatricula: aluno.status,
      dataCriacao: "",
    };
  });

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
  const alunos = await authenticatedRequest<AlunoListagemApi[]>(
    "/coordenador/alunos",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar os alunos.",
    },
  );

  return alunos.map((aluno) => {
    if (
      aluno.statusMatricula !== null &&
      !isMatriculaStatus(aluno.statusMatricula)
    ) {
      throw new Error(
        `Status de matrícula inválido recebido para ${aluno.nome}.`,
      );
    }

    return {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      telefone: aluno.telefone ?? undefined,
      turma: aluno.turma ?? "Não vinculada",
      curso: aluno.curso ?? "Não informado",
      frequencia: aluno.frequencia,
      statusConta: aluno.statusConta,
      statusMatricula: aluno.statusMatricula,
      dataCriacao: aluno.dataCriacao,
    };
  });
};

export const getStudentById = async (
  id: string,
): Promise<StudentDetail | null> => {
  try {
    const aluno = await authenticatedRequest<StudentDetail>(
      `/coordenador/alunos/${id}`,
      {
        cache: "no-store",
        fallbackError: "Falha ao carregar os dados do aluno.",
      },
    );

    for (const matricula of aluno.matriculas) {
      if (!isMatriculaStatus(matricula.status)) {
        throw new Error(
          `Status de matrícula inválido recebido para ${aluno.nome}.`,
        );
      }
    }

    return aluno;
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 400 || error.status === 404)
    ) {
      return null;
    }

    throw error;
  }
};

export const updateStudent = async (
  id: string,
  input: {
    nome: string;
    email: string;
    telefone: string | null;
    statusConta: UserStatus;
  },
): Promise<StudentDetail> => {
  return await authenticatedRequest<StudentDetail>(
    `/coordenador/alunos/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
      fallbackError: "Falha ao atualizar os dados do aluno.",
    },
  );
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
