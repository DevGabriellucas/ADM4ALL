import type { InstrutorDashboard } from "@/types/instrutor";

const eduardoAvatarSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="#c9d7ee"/>
  <circle cx="60" cy="44" r="24" fill="#2f3f62"/>
  <path d="M20 114c6-30 24-44 40-44s34 14 40 44" fill="#49699c"/>
  <circle cx="51" cy="42" r="3" fill="#f3f5fb"/>
  <circle cx="69" cy="42" r="3" fill="#f3f5fb"/>
  <path d="M49 56c7 6 15 6 22 0" fill="none" stroke="#f3f5fb" stroke-width="4" stroke-linecap="round"/>
</svg>
`);

// Mock que espelha a tela do Figma do instrutor.
// Usado enquanto a API real nao esta configurada (mesmo padrao da tela do aluno).
export const instrutorDashboardMock: InstrutorDashboard = {
  instrutor: {
    id: "9ab264bc-036b-4e62-ba6b-6a93d2da94c2",
    usuarioId: "ddba5066-6c5f-4989-b715-638a0b9a8d58",
    nome: "Eduardo Lima",
    areaAtuacao: "Administracao",
    avatarUrl: `data:image/svg+xml,${eduardoAvatarSvg}`,
  },
  turma: {
    id: "df349e38-0e92-4971-b67b-2deb56b90c7b",
    codigo: "ADM-2026-01",
    nome: "Assistente Administrativo 2026.1",
    curso: "Assistente Administrativo",
    turno: "noite",
    local: "Sala 01",
  },
  aulaReferencia: {
    id: "2e066384-6434-488f-8f6f-bdd411710bf3",
    numero: 3,
    titulo: "Gestao Empresarial",
    data: "2026-06-22",
    status: "realizada",
  },
  proximaAula: {
    id: "833962df-4847-4c06-bc3f-c704dc11fdea",
    numero: 4,
    titulo: "Rotinas Administrativas",
    data: "2026-06-28",
    status: "planejada",
  },
  metricas: {
    totalAlunos: 4,
    presentesHoje: 3,
    frequenciaMedia: 85,
  },
  alunos: [
    {
      matriculaId: "mat-001",
      alunoId: "aluno-001",
      nome: "Ana Clara Silva",
      statusPresenca: "presente",
      presencas: 8,
      faltas: 1,
      aulasRegistradas: 9,
      frequencia: 89,
    },
    {
      matriculaId: "mat-002",
      alunoId: "aluno-002",
      nome: "Douglas Silva",
      statusPresenca: "presente",
      presencas: 7,
      faltas: 2,
      aulasRegistradas: 9,
      frequencia: 78,
    },
    {
      matriculaId: "mat-003",
      alunoId: "aluno-003",
      nome: "Felipe Ribeiro",
      statusPresenca: "falta",
      presencas: 6,
      faltas: 3,
      aulasRegistradas: 9,
      frequencia: 67,
    },
    {
      matriculaId: "mat-004",
      alunoId: "aluno-004",
      nome: "Priscila Cahino",
      statusPresenca: "presente",
      presencas: 9,
      faltas: 0,
      aulasRegistradas: 9,
      frequencia: 100,
    },
  ],
  cronograma: [
    {
      id: "c1",
      numero: 1,
      titulo: "Introducao a administracao",
      data: "2026-06-08",
      status: "realizada",
    },
    {
      id: "c2",
      numero: 2,
      titulo: "Planejamento e organizacao",
      data: "2026-06-15",
      status: "realizada",
    },
    {
      id: "c3",
      numero: 3,
      titulo: "Gestao Empresarial",
      data: "2026-06-22",
      status: "realizada",
    },
    {
      id: "c4",
      numero: 4,
      titulo: "Rotinas Administrativas",
      data: "2026-06-28",
      status: "planejada",
    },
    {
      id: "c5",
      numero: 5,
      titulo: "Atendimento",
      data: "2026-07-06",
      status: "planejada",
    },
    {
      id: "c6",
      numero: 6,
      titulo: "Controle de documentos",
      data: "2026-07-13",
      status: "planejada",
    },
    {
      id: "c7",
      numero: 7,
      titulo: "Etica",
      data: "2026-07-20",
      status: "planejada",
    },
    {
      id: "c8",
      numero: 8,
      titulo: "Nocoes Financeiras",
      data: "2026-07-27",
      status: "planejada",
    },
    {
      id: "c9",
      numero: 9,
      titulo: "Tecnologia no Ambiente Administrativo",
      data: "2026-08-03",
      status: "planejada",
    },
    {
      id: "c10",
      numero: 10,
      titulo: "Revisao e Encerramento",
      data: "2026-08-10",
      status: "planejada",
    },
  ],
  materiais: [
    {
      id: "fa2d5097-5f45-404c-b201-b0635f436c12",
      titulo: "Introducao a administracao",
      descricao: null,
      tipo: "pdf",
      tamanhoBytes: 2097152,
      dataPublicacao: "2026-05-20",
      urlArquivo: "/materiais/introducao-administracao.pdf",
      aulaId: "c1",
      aulaTitulo: "Introducao a administracao",
      visibilidade: "visivel",
    },
    {
      id: "abf3710c-895e-446e-880d-7f8eb231747d",
      titulo: "Video - O que e Administracao",
      descricao: null,
      tipo: "video",
      tamanhoBytes: 5242880,
      dataPublicacao: "2026-05-27",
      urlArquivo: "/materiais/video-o-que-e-administracao.mp4",
      aulaId: "c2",
      aulaTitulo: "Planejamento e organizacao",
      visibilidade: "visivel",
    },
    {
      id: "bdfd0211-81d8-4cd1-9e88-2075bff1465a",
      titulo: "Atividade de fixacao",
      descricao: null,
      tipo: "documento",
      tamanhoBytes: 1572864,
      dataPublicacao: "2026-05-27",
      urlArquivo: "/materiais/atividade-fixacao.docx",
      aulaId: null,
      aulaTitulo: null,
      visibilidade: "oculto",
    },
  ],
};
