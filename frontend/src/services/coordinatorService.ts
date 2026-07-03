// ATENCAO: modulo de uso exclusivo do servidor. Ele le cookies de sessao
// e por isso so deve ser importado por Server Components ou Server Actions,
// nunca por componentes "use client".
import { isMatriculaStatus } from "@/constants/matriculaStatus";
import {
  coordinatorClassMaterialsMock,
  coordinatorLessonsMock,
  coordinatorProcessesMock,
  coordinatorSettingsMock,
  coordinatorUsersMock,
} from "@/mocks/coordinatorMock";
import {
  ApiError,
  type AuthenticatedFileResponse,
  authenticatedFileRequest,
  authenticatedRequest,
} from "@/services/apiClient";
import type {
  AttendanceSummary,
  BaseUser,
  CertificateDetail,
  CertificateRecord,
  ClassGroup,
  ClassMaterial,
  CoordinatorDashboardSummary,
  CoordinatorReportData,
  CoordinatorReportFilters,
  CoordinatorReportType,
  CoordinatorSettings,
  Course,
  EditableEnrollmentStatus,
  EnrollmentClassOption,
  Instructor,
  Lesson,
  ProcessRecord,
  Student,
  StudentDetail,
  StudentEnrollmentCreated,
  StudentEnrollmentStatusUpdated,
  UserStatus,
} from "@/types/coordinator";

// MOCK TEMPORARIO: materiais, processos, usuarios e configuracoes
// ainda nao tem backend e continuam retornando mock. Dashboard, cursos,
// instrutores, alunos, turmas, frequencia, certificados e relatorios
// consultam a API real.

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

interface CertificadoApi {
  referenciaId: string;
  certificadoId: string | null;
  tipo: "aluno";
  nome: string;
  curso: string;
  turma: string | null;
  frequencia: number;
  elegivel: boolean;
  motivoInelegibilidade: string | null;
  status: CertificateRecord["status"];
  codigo: string | null;
  dataEmissao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  cargaHoraria: number | null;
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

export const resendActivation = async (studentId: string): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(
    `/coordenador/alunos/${studentId}/reenviar-ativacao`,
    {
      method: "POST",
      fallbackError: "Falha ao reenviar o link de ativação.",
    },
  );
};

export const getEnrollmentClassOptions = async (): Promise<
  EnrollmentClassOption[]
> => {
  const classes = await getClasses();
  return classes
    .filter(
      (classGroup) =>
        classGroup.status === "planejada" ||
        classGroup.status === "em_andamento",
    )
    .map(({ id, nome, curso, status }) => ({ id, nome, curso, status }));
};

export const enrollStudentInClass = async (
  turmaId: string,
  alunoId: string,
): Promise<StudentEnrollmentCreated> => {
  return await authenticatedRequest<StudentEnrollmentCreated>(
    `/turmas/${turmaId}/matriculas`,
    {
      method: "POST",
      body: JSON.stringify({ alunoId }),
      fallbackError: "Falha ao vincular o aluno à turma.",
    },
  );
};

export const cancelStudentEnrollment = async (
  turmaId: string,
  matriculaId: string,
): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(
    `/turmas/${turmaId}/matriculas/${matriculaId}`,
    {
      method: "DELETE",
      fallbackError: "Falha ao cancelar a matrícula.",
    },
  );
};

export const updateMatriculaStatus = async (
  matriculaId: string,
  status: EditableEnrollmentStatus,
): Promise<StudentEnrollmentStatusUpdated> => {
  return await authenticatedRequest<StudentEnrollmentStatusUpdated>(
    `/coordenador/matriculas/${matriculaId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
      fallbackError: "Falha ao atualizar o status da matrícula.",
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
  const attendance = await authenticatedRequest<
    Array<Omit<AttendanceSummary, "situacao"> & { situacao: string }>
  >("/coordenador/frequencias", {
    cache: "no-store",
    fallbackError: "Falha ao carregar a frequência dos alunos.",
  });

  return attendance.map((record) => {
    const situacao =
      record.situacao === "risco" ? "risco_reprovacao" : record.situacao;

    if (
      situacao !== "regular" &&
      situacao !== "atencao" &&
      situacao !== "risco_reprovacao" &&
      situacao !== "reprovado_falta"
    ) {
      throw new Error(
        `Situação de frequência inválida recebida para ${record.aluno}.`,
      );
    }

    return { ...record, situacao };
  });
};

export const getLessons = async (): Promise<Lesson[]> => {
  return coordinatorLessonsMock;
};

export const getCertificates = async (): Promise<CertificateRecord[]> => {
  const certificados = await authenticatedRequest<CertificadoApi[]>(
    "/coordenador/certificados",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar os certificados.",
    },
  );

  return certificados.map((certificado) => ({
    ...certificado,
    aluno: certificado.nome,
    certificado: certificado.codigo,
  }));
};

export const downloadCertificatePdf = async (
  referenciaId: string,
): Promise<AuthenticatedFileResponse> => {
  return await authenticatedFileRequest(
    `/coordenador/certificados/aluno/${referenciaId}/pdf`,
    "Falha ao baixar o PDF do certificado.",
  );
};

export const getCertificatePdfPreview = async (
  referenciaId: string,
): Promise<AuthenticatedFileResponse> => {
  return await authenticatedFileRequest(
    `/coordenador/certificados/aluno/${referenciaId}/pdf?disposition=inline`,
    "Falha ao carregar o PDF do certificado.",
  );
};

export const issueStudentCertificate = async (
  matriculaId: string,
): Promise<CertificateDetail> => {
  return await authenticatedRequest<CertificateDetail>(
    "/coordenador/certificados/alunos",
    {
      method: "POST",
      body: JSON.stringify({ matriculaId }),
      fallbackError: "Falha ao emitir o certificado do aluno.",
    },
  );
};

export const cancelCertificate = async (
  certificadoId: string,
): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(
    `/coordenador/certificados/aluno/${certificadoId}/cancelar`,
    {
      method: "PATCH",
      fallbackError: "Falha ao cancelar o certificado.",
    },
  );
};

export const getProcesses = async (): Promise<ProcessRecord[]> => {
  return coordinatorProcessesMock;
};

export const getReports = async (): Promise<CoordinatorReportData[]> => {
  const resposta = await authenticatedRequest<{
    relatorios: CoordinatorReportData[];
  }>("/coordenador/relatorios", {
    cache: "no-store",
    fallbackError: "Falha ao carregar os relatórios.",
  });

  return resposta.relatorios;
};

export const exportReport = async (
  type: CoordinatorReportType,
  format: "pdf" | "csv",
  filters: CoordinatorReportFilters,
): Promise<AuthenticatedFileResponse> => {
  const params = new URLSearchParams();
  if (filters.dataInicio) params.set("dataInicio", filters.dataInicio);
  if (filters.dataFim) params.set("dataFim", filters.dataFim);
  if (filters.curso) params.set("curso", filters.curso);
  if (filters.turma) params.set("turma", filters.turma);
  const query = params.toString();

  return await authenticatedFileRequest(
    `/coordenador/relatorios/${type}/${format}${query ? `?${query}` : ""}`,
    `Falha ao gerar o relatório em ${format === "pdf" ? "PDF" : "CSV"}.`,
  );
};

export const getCoordinatorSettings =
  async (): Promise<CoordinatorSettings> => {
    return coordinatorSettingsMock;
  };

export const getUsers = async (): Promise<BaseUser[]> => {
  return coordinatorUsersMock;
};
