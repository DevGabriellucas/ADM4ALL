// ATENCAO: modulo de uso exclusivo do servidor. Ele le cookies de sessao
// e por isso so deve ser importado por Server Components ou Server Actions,
// nunca por componentes "use client".
import { isMatriculaStatus } from "@/constants/matriculaStatus";
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
  Course,
  EnrollmentClassOption,
  GeneratedReport,
  Instructor,
  InstructorDetail,
  Lesson,
  PaginaDeAlunos,
  PaginaDeCertificados,
  PaginaDeCursos,
  PaginaDeInstrutores,
  PaginaDeTurmas,
  ResumoDeCursos,
  ResumoDeInstrutores,
  ResumoDeTurmas,
  Student,
  StudentDetail,
  StudentEnrollmentCreated,
  UserStatus,
} from "@/types/coordinator";
import type { ArquivoUpload } from "@/types/instrutor";
import type {
  Pagina,
  ResumoDeAlunos,
  ResumoDeCertificados,
} from "@/types/paginacao";
import { ITENS_POR_PAGINA } from "@/types/paginacao";

// Modulo server-only: as telas do coordenador consultam a API real.

interface CursoApi {
  id: string;
  nome: string;
  descricao: string | null;
  cargaHoraria: number;
  periodoLetivo: string | null;
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

interface TurmaInstrutorApi {
  id: string;
  nome: string;
  curso: string;
  status: string;
  dataInicio: string;
  dataTermino: string | null;
  alunos: number;
}

interface InstrutorDetalheApi extends InstrutorApi {
  usuarioId: string;
  areaAtuacao: string | null;
  formacao: string | null;
  ativo: boolean;
  turmas: TurmaInstrutorApi[];
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
  statusTurma: Student["statusTurma"];
  dataCriacao: string;
  matriculaId: string | null;
  turmaId: string | null;
}

interface TurmaApi {
  id: string;
  nome: string;
  codigo?: string;
  curso: string;
  instrutores: string;
  alunos: number;
  capacidade: number;
  dataInicio: string;
  dataTermino: string | null;
  periodoLetivo: string;
  status: string;
  frequenciaMedia: number;
  registrosFrequencia?: number;
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
    matriculaId: string;
  }[];
  cronograma: {
    id: string;
    numeroAula: number;
    titulo: string;
    data: string;
    status: string;
  }[];
}

interface MaterialApi {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  tamanhoBytes: number | null;
  dataPublicacao: string;
  urlArquivo: string | null;
  aulaId: string | null;
  aulaTitulo: string | null;
  visibilidade: "visivel" | "oculto";
}

const mapearCurso = (curso: CursoApi): Course => ({
  id: curso.id,
  nome: curso.nome,
  descricao: curso.descricao ?? "",
  cargaHoraria: curso.cargaHoraria,
  periodoLetivo: curso.periodoLetivo ?? "",
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

const mapearInstrutorDetalhe = (
  instrutor: InstrutorDetalheApi,
): InstructorDetail => ({
  ...mapearInstrutor(instrutor),
  usuarioId: instrutor.usuarioId,
  areaAtuacao: instrutor.areaAtuacao,
  formacao: instrutor.formacao,
  ativo: instrutor.ativo,
  turmas: instrutor.turmas.map((turma) => ({
    id: turma.id,
    nome: turma.nome,
    curso: turma.curso,
    status: normalizeClassStatus(turma.status),
    dataInicio: turma.dataInicio,
    dataTermino: turma.dataTermino,
    alunos: turma.alunos,
  })),
});

const normalizeClassStatus = (status: string): ClassGroup["status"] => {
  if (
    status === "planejada" ||
    status === "em_andamento" ||
    status === "concluida" ||
    status === "encerrada" ||
    status === "cancelada"
  ) {
    return status;
  }

  throw new Error(`Status de turma inválido recebido: ${status}.`);
};

const mapearTurma = (turma: TurmaApi): ClassGroup => ({
  id: turma.id,
  nome: turma.nome,
  codigo: turma.codigo ?? "",
  curso: turma.curso,
  instrutores: turma.instrutores ?? "",
  alunos: turma.alunos,
  capacidade: turma.capacidade,
  dataInicio: turma.dataInicio,
  dataTermino: turma.dataTermino ?? "",
  periodoLetivo: turma.periodoLetivo ?? "",
  status: normalizeClassStatus(turma.status),
  frequenciaMedia: turma.frequenciaMedia,
  registrosFrequencia: turma.registrosFrequencia ?? 0,
});

const formatarTamanhoMaterial = (bytes: number | null): string => {
  if (!bytes || bytes <= 0) {
    return "-";
  }

  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const mapearAulaDaTurma = (
  aula: TurmaDetalheApi["cronograma"][number],
  detalhe: TurmaDetalheApi,
): Lesson => ({
  id: aula.id,
  turmaId: detalhe.turma.id,
  numeroAula: aula.numeroAula,
  titulo: aula.titulo,
  curso: detalhe.turma.curso,
  turma: detalhe.turma.nome,
  instrutor: detalhe.turma.instrutores ?? "",
  data: aula.data,
  status: aula.status as Lesson["status"],
});

const mapearMaterial = (
  material: MaterialApi,
  turma: ClassGroup,
): ClassMaterial => ({
  id: material.id,
  turmaId: turma.id,
  turma: turma.nome,
  nome: material.titulo,
  descricao: material.descricao,
  tipo: material.tipo.toUpperCase(),
  data: material.dataPublicacao,
  tamanho: formatarTamanhoMaterial(material.tamanhoBytes),
  urlArquivo: material.urlArquivo,
  aulaId: material.aulaId,
  aulaTitulo: material.aulaTitulo,
  visibilidade: material.visibilidade,
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

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const curso = await authenticatedRequest<CursoApi>(`/cursos/${id}`, {
      cache: "no-store",
      fallbackError: "Falha ao carregar os dados do curso.",
    });

    return mapearCurso(curso);
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

export const updateCourse = async (
  id: string,
  input: {
    nome: string;
    descricao: string;
    cargaHoraria: number;
    periodoLetivo: string;
  },
): Promise<Course> => {
  const curso = await authenticatedRequest<CursoApi>(`/cursos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    fallbackError: "Falha ao atualizar o curso.",
  });

  return mapearCurso(curso);
};

export const getClassesByCourse = async (
  courseId: string,
): Promise<ClassGroup[]> => {
  const turmas = await authenticatedRequest<TurmaApi[]>(
    `/cursos/${courseId}/turmas`,
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar as turmas do curso.",
    },
  );

  return turmas.map(mapearTurma);
};

// Exclusao real. O backend recusa curso com turma ou matricula vinculada (as
// FKs sao ON DELETE RESTRICT) e devolve a explicacao, que sobe ate a tela.
export const deleteCourse = async (id: string): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(`/cursos/${id}`, {
    method: "DELETE",
    fallbackError: "Falha ao excluir o curso.",
  });
};

export const deleteClass = async (id: string): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(`/turmas/${id}`, {
    method: "DELETE",
    fallbackError: "Falha ao excluir a turma.",
  });
};

export const deleteInstructor = async (id: string): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(
    `/coordenador/instrutores/${id}`,
    {
      method: "DELETE",
      fallbackError: "Falha ao excluir o instrutor.",
    },
  );
};

export const deleteUser = async (id: string): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(
    `/coordenador/usuarios/${id}`,
    {
      method: "DELETE",
      fallbackError: "Falha ao excluir o usuário.",
    },
  );
};

// Apaga o aluno e, em cascata, matricula, frequencia e certificado.
export const deleteStudent = async (id: string): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(`/alunos/${id}`, {
    method: "DELETE",
    fallbackError: "Falha ao excluir o aluno.",
  });
};

export const createCourse = async (input: {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  periodoLetivo: string;
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

export const inviteCoordinator = async (input: {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  areaCoordenacao?: string;
}): Promise<{ id: string; nome: string }> => {
  return await authenticatedRequest<{ id: string; nome: string }>(
    "/coordenador/coordenadores",
    {
      method: "POST",
      body: JSON.stringify(input),
      fallbackError: "Falha ao enviar o convite de coordenador.",
    },
  );
};

export const getInstructorById = async (
  id: string,
): Promise<InstructorDetail | null> => {
  try {
    const instrutor = await authenticatedRequest<InstrutorDetalheApi>(
      `/coordenador/instrutores/${id}`,
      {
        cache: "no-store",
        fallbackError: "Falha ao carregar os dados do instrutor.",
      },
    );

    return mapearInstrutorDetalhe(instrutor);
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

export const updateInstructor = async (
  id: string,
  input: {
    nome: string;
    email: string;
    telefone: string | null;
    areaAtuacao: string | null;
    formacao: string | null;
  },
): Promise<InstructorDetail> => {
  const instrutor = await authenticatedRequest<InstrutorDetalheApi>(
    `/coordenador/instrutores/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
      fallbackError: "Falha ao atualizar os dados do instrutor.",
    },
  );

  return mapearInstrutorDetalhe(instrutor);
};

export const updateInstructorStatus = async (
  id: string,
  statusConta: UserStatus,
): Promise<InstructorDetail> => {
  const instrutor = await authenticatedRequest<InstrutorDetalheApi>(
    `/coordenador/instrutores/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ statusConta }),
      fallbackError: "Falha ao atualizar o status do instrutor.",
    },
  );

  return mapearInstrutorDetalhe(instrutor);
};

export const resendInstructorActivation = async (
  instructorId: string,
): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>(
    `/coordenador/instrutores/${instructorId}/reenviar-ativacao`,
    {
      method: "POST",
      fallbackError: "Falha ao reenviar o link de ativacao.",
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

// Sem `status`: a turma nasce planejada e o servidor recalcula a situacao dela
// a partir dos alunos e das aulas.
export const createClass = async (input: {
  curso: string;
  nome: string;
  instrutores: string[];
  periodoLetivo: string;
  horarios: string;
  capacidade: number;
}): Promise<ClassGroup> => {
  const turma = await authenticatedRequest<TurmaApi>("/turmas", {
    method: "POST",
    body: JSON.stringify({
      curso: input.curso,
      nome: input.nome,
      instrutores: input.instrutores,
      periodoLetivo: input.periodoLetivo,
      horarios: input.horarios,
      limiteAlunos: input.capacidade,
    }),
    fallbackError: "Falha ao cadastrar a turma.",
  });

  return mapearTurma(turma);
};

export const updateClass = async (
  id: string,
  input: {
    nome: string;
    curso: string;
    instrutores: string[];
    periodoLetivo: string;
    capacidade: number;
  },
): Promise<ClassGroup> => {
  const turma = await authenticatedRequest<TurmaApi>(`/turmas/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      nome: input.nome,
      curso: input.curso,
      instrutores: input.instrutores,
      periodoLetivo: input.periodoLetivo,
      capacidade: input.capacidade,
    }),
    fallbackError: "Falha ao atualizar a turma.",
  });

  return mapearTurma(turma);
};

// Cancelar (e desfazer) e a unica mudanca de status que parte da coordenacao.
// Ao reativar, o servidor devolve a turma para a regra automatica.
export const setClassCancelled = async (
  id: string,
  cancelada: boolean,
): Promise<ClassGroup> => {
  const turma = await authenticatedRequest<TurmaApi>(
    `/turmas/${id}/cancelamento`,
    {
      method: "PATCH",
      body: JSON.stringify({ cancelada }),
      fallbackError: cancelada
        ? "Falha ao cancelar a turma."
        : "Falha ao reativar a turma.",
    },
  );

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
      statusTurma: normalizeClassStatus(detalhe.turma.status),
      dataCriacao: "",
      matriculaId: aluno.matriculaId,
    };
  });

  const lessons: Lesson[] = detalhe.cronograma.map((aula) => ({
    ...mapearAulaDaTurma(aula, detalhe),
  }));

  return { students, lessons };
};

const mapearAluno = (aluno: AlunoListagemApi): Student => {
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
    statusTurma: aluno.statusTurma,
    dataCriacao: aluno.dataCriacao,
    matriculaId: aluno.matriculaId ?? null,
    turmaId: aluno.turmaId ?? null,
  };
};

// Lista inteira: alimenta o seletor de "adicionar aluno na turma". A tela de
// Alunos usa getStudentsPage.
export const getStudents = async (): Promise<Student[]> => {
  const alunos = await authenticatedRequest<AlunoListagemApi[]>(
    "/coordenador/alunos",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar os alunos.",
    },
  );

  return alunos.map(mapearAluno);
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

export const updateUserStatus = async (
  id: string,
  status: "ativo" | "inativo",
): Promise<BaseUser> => {
  return await authenticatedRequest<BaseUser>(
    `/coordenador/usuarios/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
      fallbackError: "Falha ao atualizar o status do usuário.",
    },
  );
};

export const updateUser = async (
  id: string,
  input: {
    nome: string;
    email: string;
    cpf: string;
  },
): Promise<BaseUser> => {
  return await authenticatedRequest<BaseUser>(`/coordenador/usuarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    fallbackError: "Falha ao atualizar o usuário.",
  });
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

export const getClassMaterials = async (
  classId: string,
  classGroup?: ClassGroup,
): Promise<ClassMaterial[]> => {
  const turma = classGroup ?? (await getClassById(classId));
  if (!turma) {
    return [];
  }

  const resposta = await authenticatedRequest<{ materiais: MaterialApi[] }>(
    `/turmas/${classId}/materiais`,
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar os materiais da turma.",
    },
  );

  return resposta.materiais.map((material) => mapearMaterial(material, turma));
};

const mapearFrequencia = (
  record: Omit<AttendanceSummary, "situacao"> & { situacao: string },
): AttendanceSummary => {
  const situacao =
    record.situacao === "risco" ? "risco_reprovacao" : record.situacao;

  if (
    situacao !== "regular" &&
    situacao !== "atencao" &&
    situacao !== "risco_reprovacao" &&
    situacao !== "sem_registro" &&
    situacao !== "reprovado_falta"
  ) {
    throw new Error(
      `Situação de frequência inválida recebida para ${record.aluno}.`,
    );
  }

  return { ...record, situacao };
};

// Lista inteira: o painel e a tela de detalhe da turma somam sobre ela. A tela
// de Frequencia usa getAttendanceSummaryPage.
export const getAttendanceSummary = async (): Promise<AttendanceSummary[]> => {
  const attendance = await authenticatedRequest<
    Array<Omit<AttendanceSummary, "situacao"> & { situacao: string }>
  >("/coordenador/frequencias", {
    cache: "no-store",
    fallbackError: "Falha ao carregar a frequência dos alunos.",
  });

  return attendance.map(mapearFrequencia);
};

// As operacoes de aula (criar/atualizar/remover) vivem em instrutorService.ts,
// que e quem consome os endpoints /turmas/:id/aulas.

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

export const getGeneratedReports = async (
  limite?: number,
): Promise<GeneratedReport[]> => {
  const params = new URLSearchParams();
  if (limite) params.set("limite", String(limite));
  const query = params.toString();

  const resposta = await authenticatedRequest<{
    relatorios: GeneratedReport[];
  }>(`/coordenador/relatorios/gerados${query ? `?${query}` : ""}`, {
    cache: "no-store",
    fallbackError: "Falha ao carregar os relatórios gerados.",
  });

  return resposta.relatorios;
};

export const generateReport = async (input: {
  tipo: CoordinatorReportType;
  filtros: CoordinatorReportFilters;
}): Promise<GeneratedReport> => {
  return await authenticatedRequest<GeneratedReport>(
    "/coordenador/relatorios/gerados",
    {
      method: "POST",
      body: JSON.stringify(input),
      fallbackError: "Falha ao gerar o relatório.",
    },
  );
};

export const downloadGeneratedReportCsv = async (
  id: string,
): Promise<AuthenticatedFileResponse> => {
  return await authenticatedFileRequest(
    `/coordenador/relatorios/gerados/${id}/csv`,
    "Falha ao baixar o CSV do relatório.",
  );
};

export const downloadGeneratedReportPdf = async (
  id: string,
): Promise<AuthenticatedFileResponse> => {
  return await authenticatedFileRequest(
    `/coordenador/relatorios/gerados/${id}/pdf`,
    "Falha ao baixar o PDF do relatório.",
  );
};

export const deleteGeneratedReport = async (id: string): Promise<void> => {
  await authenticatedRequest<void>(`/coordenador/relatorios/gerados/${id}`, {
    method: "DELETE",
    fallbackError: "Falha ao excluir o relatório.",
  });
};

export interface PerfilCoordenador {
  usuarioId: string;
  coordenadorId: string | null;
  nome: string;
  email: string;
  perfil: string;
  areaCoordenacao: string | null;
  avatarUrl: string | null;
}

export const getPerfilCoordenador = async (): Promise<PerfilCoordenador> => {
  return await authenticatedRequest<PerfilCoordenador>(
    "/coordenadores/me/perfil",
    {
      cache: "no-store",
      fallbackError: "Falha ao carregar o perfil.",
    },
  );
};

export const atualizarAvatarCoordenador = async (
  arquivo: ArquivoUpload,
): Promise<{ avatarUrl: string }> => {
  return await authenticatedRequest<{ avatarUrl: string }>(
    "/coordenadores/me/avatar",
    {
      method: "POST",
      body: JSON.stringify({ arquivo }),
      fallbackError: "Falha ao atualizar a foto de perfil.",
    },
  );
};

export const removerAvatarCoordenador = async (): Promise<void> => {
  await authenticatedRequest<{ mensagem: string }>("/coordenadores/me/avatar", {
    method: "DELETE",
    fallbackError: "Falha ao remover a foto de perfil.",
  });
};

// ---------------------------------------------------------------------------
// Listagens paginadas
//
// As funcoes acima continuam existindo e devolvendo a colecao inteira: elas
// alimentam os combos das telas (curso e turma no cadastro de aluno, nos
// filtros de certificado e de relatorio), que precisam de todas as opcoes.
// As funcoes daqui para baixo servem as telas de listagem.
// ---------------------------------------------------------------------------

const enderecoDaListagem = (
  recurso: string,
  parametros: Record<string, string | number | undefined>,
): string => {
  const query = new URLSearchParams();

  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== "") query.set(chave, String(valor));
  }

  return `/listagens/${recurso}?${query.toString()}`;
};

// `Resumo` carrega os contadores dos cartoes, que vem junto com a pagina. As
// listagens sem cartao usam o padrao, que e nada a mais.
const buscarPagina = async <Api, Item, Resumo = Record<string, never>>(
  recurso: string,
  parametros: Record<string, string | number | undefined>,
  mapear: (item: Api) => Item,
  erro: string,
): Promise<Pagina<Item> & Resumo> => {
  const resposta = await authenticatedRequest<Pagina<Api> & Resumo>(
    enderecoDaListagem(recurso, parametros),
    { cache: "no-store", fallbackError: erro },
  );

  return { ...resposta, itens: resposta.itens.map(mapear) };
};

export const getCoursesPage = async (
  pagina: number,
  porPagina = ITENS_POR_PAGINA,
): Promise<PaginaDeCursos> =>
  await buscarPagina<CursoApi, Course, { resumo: ResumoDeCursos }>(
    "cursos",
    { pagina, porPagina },
    mapearCurso,
    "Falha ao carregar os cursos.",
  );

export const getClassesPage = async (
  pagina: number,
  porPagina = ITENS_POR_PAGINA,
): Promise<PaginaDeTurmas> =>
  await buscarPagina<TurmaApi, ClassGroup, { resumo: ResumoDeTurmas }>(
    "turmas",
    { pagina, porPagina },
    mapearTurma,
    "Falha ao carregar as turmas.",
  );

export const getInstructorsPage = async (
  pagina: number,
  porPagina = ITENS_POR_PAGINA,
): Promise<PaginaDeInstrutores> =>
  await buscarPagina<InstrutorApi, Instructor, { resumo: ResumoDeInstrutores }>(
    "instrutores",
    { pagina, porPagina },
    mapearInstrutor,
    "Falha ao carregar os instrutores.",
  );

export const getStudentsPage = async (
  pagina: number,
  porPagina = ITENS_POR_PAGINA,
): Promise<PaginaDeAlunos> => {
  const resposta = await authenticatedRequest<
    Pagina<AlunoListagemApi> & { resumo: ResumoDeAlunos }
  >(enderecoDaListagem("alunos", { pagina, porPagina }), {
    cache: "no-store",
    fallbackError: "Falha ao carregar os alunos.",
  });

  return { ...resposta, itens: resposta.itens.map(mapearAluno) };
};

export const getUsersPage = async (
  pagina: number,
  filtros: {
    busca?: string;
    perfil?: string;
    status?: string;
    ordenacao?: string;
  } = {},
  porPagina = ITENS_POR_PAGINA,
): Promise<Pagina<BaseUser>> =>
  await authenticatedRequest<Pagina<BaseUser>>(
    enderecoDaListagem("usuarios", { pagina, porPagina, ...filtros }),
    { cache: "no-store", fallbackError: "Falha ao carregar os usuarios." },
  );

export const getCertificatesPage = async (
  pagina: number,
  filtros: { curso?: string; turma?: string; status?: string } = {},
  porPagina = ITENS_POR_PAGINA,
): Promise<PaginaDeCertificados> => {
  const resposta = await authenticatedRequest<
    Pagina<CertificadoApi> & { resumo: ResumoDeCertificados }
  >(enderecoDaListagem("certificados", { pagina, porPagina, ...filtros }), {
    cache: "no-store",
    fallbackError: "Falha ao carregar os certificados.",
  });

  return {
    ...resposta,
    itens: resposta.itens.map((certificado) => ({
      ...certificado,
      aluno: certificado.nome,
      certificado: certificado.codigo,
    })),
  };
};

export const getAttendanceSummaryPage = async (
  pagina: number,
  filtros: {
    curso?: string;
    turma?: string;
    aluno?: string;
    periodo?: string;
  } = {},
  porPagina = ITENS_POR_PAGINA,
): Promise<Pagina<AttendanceSummary>> =>
  await buscarPagina<
    Omit<AttendanceSummary, "situacao"> & { situacao: string },
    AttendanceSummary
  >(
    "frequencias",
    { pagina, porPagina, ...filtros },
    mapearFrequencia,
    "Falha ao carregar a frequência dos alunos.",
  );
