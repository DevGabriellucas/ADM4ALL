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
    id: "20000000-0000-0000-0000-000000000001",
    usuarioId: "10000000-0000-0000-0000-000000000004",
    nome: "Eduardo Lima",
    areaAtuacao: "Administracao",
    avatarUrl: `data:image/svg+xml,${eduardoAvatarSvg}`,
  },
  turma: {
    id: "40000000-0000-0000-0000-000000000001",
    codigo: "ADM-2026-01",
    nome: "Assistente Administrativo 2026.1",
    curso: "Assistente Administrativo",
    turno: "noite",
    local: "Sala 01",
  },
  aulaReferencia: {
    id: "50000000-0000-0000-0000-000000000003",
    numero: 3,
    titulo: "Gestao Empresarial",
    data: "2026-06-22",
    status: "realizada",
  },
  proximaAula: {
    id: "50000000-0000-0000-0000-000000000004",
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
    },
    {
      matriculaId: "mat-002",
      alunoId: "aluno-002",
      nome: "Douglas Silva",
      statusPresenca: "presente",
    },
    {
      matriculaId: "mat-003",
      alunoId: "aluno-003",
      nome: "Felipe Ribeiro",
      statusPresenca: "falta",
    },
    {
      matriculaId: "mat-004",
      alunoId: "aluno-004",
      nome: "Priscila Cahino",
      statusPresenca: "presente",
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
      id: "60000000-0000-0000-0000-000000000001",
      titulo: "Introducao a administracao",
      tipo: "pdf",
      tamanhoBytes: 2097152,
      dataPublicacao: "2026-05-20",
      urlArquivo: "/materiais/introducao-administracao.pdf",
    },
    {
      id: "60000000-0000-0000-0000-000000000002",
      titulo: "Video - O que e Administracao",
      tipo: "video",
      tamanhoBytes: 5242880,
      dataPublicacao: "2026-05-27",
      urlArquivo: "/materiais/video-o-que-e-administracao.mp4",
    },
    {
      id: "60000000-0000-0000-0000-000000000003",
      titulo: "Atividade de fixacao",
      tipo: "documento",
      tamanhoBytes: 1572864,
      dataPublicacao: "2026-05-27",
      urlArquivo: "/materiais/atividade-fixacao.docx",
    },
  ],
};
