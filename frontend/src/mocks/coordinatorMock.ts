import { MATRICULA_STATUS } from "@/constants/matriculaStatus";
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

export const coordinatorCoursesMock: Course[] = [
  {
    id: "course-001",
    nome: "Assistente Administrativo",
    descricao: "Formacao introdutoria para rotinas administrativas.",
    cargaHoraria: 40,
    status: "ativo",
    quantidadeTurmas: 2,
  },
  {
    id: "course-002",
    nome: "Atendimento ao Cliente",
    descricao: "Boas praticas de comunicacao, atendimento e pos-venda.",
    cargaHoraria: 24,
    status: "ativo",
    quantidadeTurmas: 1,
  },
  {
    id: "course-003",
    nome: "Nocoes Financeiras",
    descricao: "Conceitos basicos de organizacao financeira.",
    cargaHoraria: 20,
    status: "em_planejamento",
    quantidadeTurmas: 0,
  },
];

export const coordinatorInstructorsMock: Instructor[] = [
  {
    id: "instructor-001",
    nome: "Eduardo Lima",
    email: "eduardo.lima@example.com",
    telefone: "(83) 99999-1111",
    status: "ativo",
    turmasVinculadas: 2,
    dataCriacao: "2026-05-10",
  },
  {
    id: "instructor-002",
    nome: "Camila Souza",
    email: "camila.souza@example.com",
    telefone: "(83) 99999-2222",
    status: "ativo",
    turmasVinculadas: 1,
    dataCriacao: "2026-05-14",
  },
  {
    id: "instructor-003",
    nome: "Renato Alves",
    email: "renato.alves@example.com",
    status: "pendente_ativacao",
    turmasVinculadas: 0,
    dataCriacao: "2026-06-01",
  },
];

export const coordinatorStudentsMock: Student[] = [
  {
    id: "student-001",
    nome: "Ana Clara Silva",
    email: "ana.clara@example.com",
    telefone: "(83) 98888-1001",
    turma: "ADM-2026-01",
    curso: "Assistente Administrativo",
    frequencia: 92,
    statusConta: "ativo",
    statusMatricula: MATRICULA_STATUS.EM_ANDAMENTO,
    dataCriacao: "2026-05-20",
  },
  {
    id: "student-002",
    nome: "Douglas Silva",
    email: "douglas.silva@example.com",
    telefone: "(83) 98888-1002",
    turma: "ADM-2026-01",
    curso: "Assistente Administrativo",
    frequencia: 78,
    statusConta: "ativo",
    statusMatricula: MATRICULA_STATUS.EM_ANDAMENTO,
    dataCriacao: "2026-05-20",
  },
  {
    id: "student-003",
    nome: "Felipe Ribeiro",
    email: "felipe.ribeiro@example.com",
    turma: "ADM-2026-01",
    curso: "Assistente Administrativo",
    frequencia: 70,
    statusConta: "ativo",
    statusMatricula: MATRICULA_STATUS.REPROVADO_FALTA,
    dataCriacao: "2026-05-21",
  },
  {
    id: "student-004",
    nome: "Priscila Cahino",
    email: "priscila.cahino@example.com",
    telefone: "(83) 98888-1004",
    turma: "ATD-2026-01",
    curso: "Atendimento ao Cliente",
    frequencia: 96,
    statusConta: "ativo",
    statusMatricula: MATRICULA_STATUS.EM_ANDAMENTO,
    dataCriacao: "2026-05-22",
  },
  {
    id: "student-005",
    nome: "Mariana Costa",
    email: "mariana.costa@example.com",
    telefone: "(83) 98888-1005",
    turma: "Não vinculada",
    curso: "Noções Financeiras",
    frequencia: 0,
    statusConta: "pendente_ativacao",
    statusMatricula: null,
    dataCriacao: "2026-06-24",
  },
  {
    id: "student-006",
    nome: "Lucas Azevedo",
    email: "lucas.azevedo@example.com",
    turma: "ATD-2026-01",
    curso: "Atendimento ao Cliente",
    frequencia: 72,
    statusConta: "ativo",
    statusMatricula: MATRICULA_STATUS.EM_ANDAMENTO,
    dataCriacao: "2026-05-24",
  },
  {
    id: "student-007",
    nome: "Carla Menezes",
    email: "carla.menezes@example.com",
    turma: "ATD-2026-01",
    curso: "Atendimento ao Cliente",
    frequencia: 85,
    statusConta: "ativo",
    statusMatricula: MATRICULA_STATUS.EM_ANDAMENTO,
    dataCriacao: "2026-05-25",
  },
];

export const coordinatorClassesMock: ClassGroup[] = [
  {
    id: "class-001",
    nome: "ADM-2026-01",
    curso: "Assistente Administrativo",
    instrutor: "Eduardo Lima",
    alunos: 28,
    dataInicio: "2026-06-08",
    dataTermino: "2026-08-10",
    status: "em_andamento",
    frequenciaMedia: 86,
  },
  {
    id: "class-002",
    nome: "ADM-2026-02",
    curso: "Assistente Administrativo",
    instrutor: "Eduardo Lima",
    alunos: 24,
    dataInicio: "2026-07-01",
    dataTermino: "2026-09-02",
    status: "planejada",
    frequenciaMedia: 0,
  },
  {
    id: "class-003",
    nome: "ATD-2026-01",
    curso: "Atendimento ao Cliente",
    instrutor: "Camila Souza",
    alunos: 18,
    dataInicio: "2026-06-12",
    dataTermino: "2026-07-24",
    status: "em_andamento",
    frequenciaMedia: 91,
  },
  {
    id: "class-004",
    nome: "FIN-2025-02",
    curso: "Noções Financeiras",
    instrutor: "Camila Souza",
    alunos: 16,
    dataInicio: "2025-10-06",
    dataTermino: "2025-11-24",
    status: "encerrada",
    frequenciaMedia: 89,
  },
];

export const coordinatorLessonsMock: Lesson[] = [
  {
    id: "lesson-001",
    numeroAula: 1,
    titulo: "Introducao a administracao",
    curso: "Assistente Administrativo",
    turma: "ADM-2026-01",
    instrutor: "Eduardo Lima",
    data: "2026-06-08",
    status: "realizada",
  },
  {
    id: "lesson-002",
    numeroAula: 2,
    titulo: "Planejamento e organizacao",
    curso: "Assistente Administrativo",
    turma: "ADM-2026-01",
    instrutor: "Eduardo Lima",
    data: "2026-06-15",
    status: "realizada",
  },
  {
    id: "lesson-003",
    numeroAula: 3,
    titulo: "Gestao empresarial",
    curso: "Assistente Administrativo",
    turma: "ADM-2026-01",
    instrutor: "Eduardo Lima",
    data: "2026-06-22",
    status: "realizada",
  },
  {
    id: "lesson-004",
    numeroAula: 4,
    titulo: "Rotinas administrativas",
    curso: "Assistente Administrativo",
    turma: "ADM-2026-01",
    instrutor: "Eduardo Lima",
    data: "2026-06-29",
    status: "planejada",
  },
  {
    id: "lesson-005",
    numeroAula: 1,
    titulo: "Comunicação e experiência do cliente",
    curso: "Atendimento ao Cliente",
    turma: "ATD-2026-01",
    instrutor: "Camila Souza",
    data: "2026-06-24",
    status: "planejada",
  },
  {
    id: "lesson-006",
    numeroAula: 2,
    titulo: "Técnicas de atendimento",
    curso: "Atendimento ao Cliente",
    turma: "ATD-2026-01",
    instrutor: "Camila Souza",
    data: "2026-07-03",
    status: "cancelada",
  },
];

export const coordinatorClassMaterialsMock: ClassMaterial[] = [
  {
    id: "material-001",
    turma: "ADM-2026-01",
    nome: "Introdução à administração",
    tipo: "PDF",
    data: "2026-06-08",
    tamanho: "2,4 MB",
  },
  {
    id: "material-002",
    turma: "ADM-2026-01",
    nome: "Modelo de planejamento semanal",
    tipo: "Planilha",
    data: "2026-06-15",
    tamanho: "840 KB",
  },
  {
    id: "material-003",
    turma: "ATD-2026-01",
    nome: "Boas práticas de atendimento",
    tipo: "Apresentação",
    data: "2026-06-12",
    tamanho: "5,1 MB",
  },
];

export const coordinatorAttendanceMock: AttendanceSummary[] = [
  {
    aluno: "Ana Clara Silva",
    turma: "ADM-2026-01",
    presencas: 11,
    faltas: 1,
    frequencia: 92,
    situacao: "regular",
  },
  {
    aluno: "Douglas Silva",
    turma: "ADM-2026-01",
    presencas: 7,
    faltas: 2,
    frequencia: 78,
    situacao: "atencao",
  },
  {
    aluno: "Felipe Ribeiro",
    turma: "ADM-2026-01",
    presencas: 8,
    faltas: 4,
    frequencia: 70,
    situacao: MATRICULA_STATUS.REPROVADO_FALTA,
  },
  {
    aluno: "Priscila Cahino",
    turma: "ATD-2026-01",
    presencas: 12,
    faltas: 0,
    frequencia: 96,
    situacao: "regular",
  },
  {
    aluno: "Lucas Azevedo",
    turma: "ATD-2026-01",
    presencas: 8,
    faltas: 3,
    frequencia: 72,
    situacao: "risco_reprovacao",
  },
  {
    aluno: "Carla Menezes",
    turma: "ATD-2026-01",
    presencas: 11,
    faltas: 2,
    frequencia: 85,
    situacao: "regular",
  },
];

export const coordinatorCertificatesMock: CertificateRecord[] = [
  {
    aluno: "Ana Clara Silva",
    curso: "Assistente Administrativo",
    turma: "ADM-2026-01",
    frequencia: 92,
    status: "elegivel",
    certificado: null,
  },
  {
    aluno: "Douglas Silva",
    curso: "Assistente Administrativo",
    turma: "ADM-2026-01",
    frequencia: 78,
    status: "nao_elegivel",
    certificado: null,
  },
  {
    aluno: "Felipe Ribeiro",
    curso: "Assistente Administrativo",
    turma: "ADM-2026-01",
    frequencia: 70,
    status: "nao_elegivel",
    certificado: null,
  },
  {
    aluno: "Priscila Cahino",
    curso: "Atendimento ao Cliente",
    turma: "ATD-2026-01",
    frequencia: 96,
    status: "emitido",
    certificado: "CERT-ATD-2026-0001",
  },
  {
    aluno: "Carla Menezes",
    curso: "Atendimento ao Cliente",
    turma: "ATD-2026-01",
    frequencia: 85,
    status: "pendente",
    certificado: null,
  },
];

export const coordinatorProcessesMock: ProcessRecord[] = [
  {
    id: "process-001",
    nome: "Validacao de novos alunos",
    status: "aberto",
    responsavel: "Marina Araujo",
    dataCriacao: "2026-06-03",
  },
  {
    id: "process-002",
    nome: "Conferencia de frequencia",
    status: "em_analise",
    responsavel: "Eduardo Lima",
    dataCriacao: "2026-06-12",
  },
  {
    id: "process-003",
    nome: "Emissao de certificados",
    status: "aberto",
    responsavel: "Marina Araujo",
    dataCriacao: "2026-06-20",
  },
  {
    id: "process-004",
    nome: "Revisão de matrículas",
    status: "concluido",
    responsavel: "Marina Araujo",
    dataCriacao: "2026-05-18",
  },
  {
    id: "process-005",
    nome: "Atualização de material didático",
    status: "cancelado",
    responsavel: "Eduardo Lima",
    dataCriacao: "2026-05-25",
  },
];

export const coordinatorUsersMock: BaseUser[] = [
  {
    id: "user-001",
    nome: "Marina Araujo",
    email: "marina.araujo@example.com",
    role: "coordenador",
    status: "ativo",
    dataCriacao: "2026-05-01",
    ultimoAcesso: "2026-06-26T08:40:00-03:00",
  },
  {
    id: "user-002",
    nome: "Eduardo Lima",
    email: "eduardo.lima@example.com",
    role: "instrutor",
    status: "ativo",
    dataCriacao: "2026-05-10",
    ultimoAcesso: "2026-06-25T19:15:00-03:00",
  },
  {
    id: "user-003",
    nome: "Renato Alves",
    email: "renato.alves@example.com",
    role: "instrutor",
    status: "pendente_ativacao",
    dataCriacao: "2026-06-01",
    ultimoAcesso: null,
  },
  {
    id: "user-004",
    nome: "Ana Clara Silva",
    email: "ana.clara@example.com",
    role: "aluno",
    status: "ativo",
    dataCriacao: "2026-05-20",
    ultimoAcesso: "2026-06-24T14:20:00-03:00",
  },
  {
    id: "user-005",
    nome: "Roberto Nunes",
    email: "roberto.nunes@example.com",
    role: "administrador",
    status: "ativo",
    dataCriacao: "2026-04-15",
    ultimoAcesso: "2026-06-26T07:55:00-03:00",
  },
  {
    id: "user-006",
    nome: "Júlia Fernandes",
    email: "julia.fernandes@example.com",
    role: "aluno",
    status: "inativo",
    dataCriacao: "2026-04-28",
    ultimoAcesso: "2026-05-30T10:05:00-03:00",
  },
];

export const coordinatorReportsMock: CoordinatorReportData[] = [
  {
    type: "frequencia_turma",
    title: "Frequência por turma",
    description: "Média de frequência registrada em cada turma.",
    metricLabel: "Frequência média",
    metricSuffix: "%",
    aggregation: "average",
    columns: [
      { key: "turma", label: "Turma" },
      { key: "curso", label: "Curso" },
      { key: "frequencia", label: "Frequência" },
    ],
    rows: coordinatorClassesMock.map((classGroup) => ({
      id: `report-attendance-${classGroup.id}`,
      data: classGroup.dataInicio,
      curso: classGroup.curso,
      turma: classGroup.nome,
      chartLabel: classGroup.nome,
      chartValue: classGroup.frequenciaMedia,
      values: {
        turma: classGroup.nome,
        curso: classGroup.curso,
        frequencia: `${classGroup.frequenciaMedia}%`,
      },
    })),
  },
  {
    type: "reprovados_falta",
    title: "Alunos reprovados por falta",
    description: "Alunos com reprovação consolidada por frequência.",
    metricLabel: "Alunos reprovados",
    aggregation: "count",
    columns: [
      { key: "aluno", label: "Aluno" },
      { key: "turma", label: "Turma" },
      { key: "frequencia", label: "Frequência" },
    ],
    rows: coordinatorStudentsMock
      .filter(
        (student) =>
          student.statusMatricula === MATRICULA_STATUS.REPROVADO_FALTA,
      )
      .map((student) => ({
        id: `report-failed-${student.id}`,
        data: student.dataCriacao,
        curso: student.curso,
        turma: student.turma,
        chartLabel: student.nome,
        chartValue: 1,
        values: {
          aluno: student.nome,
          turma: student.turma,
          frequencia: `${student.frequencia}%`,
        },
      })),
  },
  {
    type: "elegiveis_certificado",
    title: "Alunos elegíveis para certificado",
    description: "Alunos que atingiram frequência igual ou superior a 80%.",
    metricLabel: "Alunos elegíveis",
    aggregation: "count",
    columns: [
      { key: "aluno", label: "Aluno" },
      { key: "curso", label: "Curso" },
      { key: "frequencia", label: "Frequência" },
      { key: "status", label: "Status" },
    ],
    rows: coordinatorCertificatesMock
      .filter((certificate) => certificate.frequencia >= 80)
      .map((certificate, index) => ({
        id: `report-eligible-${index}`,
        data:
          coordinatorClassesMock.find(
            (classGroup) => classGroup.nome === certificate.turma,
          )?.dataTermino ?? "2026-06-26",
        curso: certificate.curso,
        turma: certificate.turma,
        chartLabel: certificate.aluno,
        chartValue: 1,
        values: {
          aluno: certificate.aluno,
          curso: certificate.curso,
          frequencia: `${certificate.frequencia}%`,
          status:
            certificate.status === "emitido" ? "Emitido" : "Apto à emissão",
        },
      })),
  },
  {
    type: "certificados_emitidos",
    title: "Certificados emitidos",
    description: "Certificados concluídos e disponíveis para os alunos.",
    metricLabel: "Certificados emitidos",
    aggregation: "count",
    columns: [
      { key: "aluno", label: "Aluno" },
      { key: "curso", label: "Curso" },
      { key: "turma", label: "Turma" },
      { key: "certificado", label: "Certificado" },
    ],
    rows: coordinatorCertificatesMock
      .filter((certificate) => certificate.status === "emitido")
      .map((certificate, index) => ({
        id: `report-issued-${index}`,
        data:
          coordinatorClassesMock.find(
            (classGroup) => classGroup.nome === certificate.turma,
          )?.dataTermino ?? "2026-06-26",
        curso: certificate.curso,
        turma: certificate.turma,
        chartLabel: certificate.aluno,
        chartValue: 1,
        values: {
          aluno: certificate.aluno,
          curso: certificate.curso,
          turma: certificate.turma,
          certificado: certificate.certificado ?? "-",
        },
      })),
  },
  {
    type: "matriculas_curso",
    title: "Matrículas por curso",
    description: "Distribuição de alunos matriculados entre os cursos.",
    metricLabel: "Total de matrículas",
    aggregation: "sum",
    columns: [
      { key: "curso", label: "Curso" },
      { key: "turmas", label: "Turmas" },
      { key: "matriculas", label: "Matrículas" },
    ],
    rows: coordinatorCoursesMock.map((course) => {
      const courseClasses = coordinatorClassesMock.filter(
        (classGroup) => classGroup.curso === course.nome,
      );
      const enrollments = courseClasses.reduce(
        (total, classGroup) => total + classGroup.alunos,
        0,
      );

      return {
        id: `report-enrollment-${course.id}`,
        data: courseClasses[0]?.dataInicio ?? "2026-01-01",
        curso: course.nome,
        turma: "",
        chartLabel: course.nome,
        chartValue: enrollments,
        values: {
          curso: course.nome,
          turmas: courseClasses.length,
          matriculas: enrollments,
        },
      };
    }),
  },
  {
    type: "turmas_andamento",
    title: "Turmas em andamento",
    description: "Turmas ativas no período selecionado.",
    metricLabel: "Turmas em andamento",
    aggregation: "count",
    columns: [
      { key: "turma", label: "Turma" },
      { key: "curso", label: "Curso" },
      { key: "instrutor", label: "Instrutor" },
      { key: "alunos", label: "Alunos" },
    ],
    rows: coordinatorClassesMock
      .filter((classGroup) => classGroup.status === "em_andamento")
      .map((classGroup) => ({
        id: `report-active-class-${classGroup.id}`,
        data: classGroup.dataInicio,
        curso: classGroup.curso,
        turma: classGroup.nome,
        chartLabel: classGroup.nome,
        chartValue: classGroup.alunos,
        values: {
          turma: classGroup.nome,
          curso: classGroup.curso,
          instrutor: classGroup.instrutor,
          alunos: classGroup.alunos,
        },
      })),
  },
];

export const coordinatorSettingsMock: CoordinatorSettings = {
  account: {
    nome: "Marina Araujo",
    email: "marina.araujo@example.com",
    telefone: "(83) 99999-4001",
    cargo: "Coordenadora Acadêmica",
  },
  system: {
    instituicao: "Centro Universitário UNIPÊ",
    periodoLetivo: "2026.1",
    frequenciaMinimaCertificado: 80,
  },
  accessProfiles: [
    {
      role: "administrador",
      label: "Administrador",
      description: "Acesso completo às configurações e permissões.",
      enabled: true,
    },
    {
      role: "coordenador",
      label: "Coordenador",
      description: "Gestão acadêmica, relatórios e acompanhamento geral.",
      enabled: true,
    },
    {
      role: "instrutor",
      label: "Instrutor",
      description: "Gestão das aulas, materiais e frequência das turmas.",
      enabled: true,
    },
    {
      role: "aluno",
      label: "Aluno",
      description: "Consulta de curso, frequência e progresso acadêmico.",
      enabled: true,
    },
  ],
  security: {
    sessoesAtivas: 2,
    ultimaAlteracaoSenha: "2026-05-18",
  },
};

export const coordinatorDashboardSummaryMock: CoordinatorDashboardSummary = {
  totalCursos: coordinatorCoursesMock.length,
  totalTurmas: coordinatorClassesMock.length,
  totalAlunos: coordinatorStudentsMock.length,
  totalInstrutores: coordinatorInstructorsMock.length,
  frequenciaMedia: 87,
  certificadosPendentes: coordinatorCertificatesMock.filter(
    (certificate) => certificate.status === "pendente",
  ).length,
  processosAbertos: coordinatorProcessesMock.filter(
    (process) => process.status === "aberto",
  ).length,
  usuariosPendentes: coordinatorUsersMock.filter(
    (user) => user.status === "pendente_ativacao",
  ).length,
  relatorios: [
    {
      id: "report-001",
      tipo: "dashboard",
      titulo: "Resumo geral",
      descricao: "Indicadores consolidados da operacao.",
      ultimaAtualizacao: "2026-06-26",
    },
    {
      id: "report-002",
      tipo: "frequencia",
      titulo: "Frequencia por turma",
      descricao: "Acompanhamento de presencas e faltas.",
      ultimaAtualizacao: "2026-06-25",
    },
    {
      id: "report-003",
      tipo: "certificados",
      titulo: "Certificados",
      descricao: "Status de certificados elegíveis, pendentes e emitidos.",
      ultimaAtualizacao: "2026-06-24",
    },
  ],
};
