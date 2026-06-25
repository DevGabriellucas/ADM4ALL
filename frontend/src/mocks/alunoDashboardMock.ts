import type { AlunoDashboard } from "@/types/aluno";

const diegoAvatarSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="#c9d7ee"/>
  <circle cx="60" cy="46" r="24" fill="#2f3f62"/>
  <path d="M22 112c6-28 22-42 38-42s32 14 38 42" fill="#49699c"/>
  <circle cx="51" cy="43" r="3" fill="#f3f5fb"/>
  <circle cx="69" cy="43" r="3" fill="#f3f5fb"/>
  <path d="M49 58c7 6 15 6 22 0" fill="none" stroke="#f3f5fb" stroke-width="4" stroke-linecap="round"/>
</svg>
`);

const joseAvatarSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="#d8e0f2"/>
  <circle cx="60" cy="45" r="24" fill="#52617f"/>
  <path d="M24 112c5-27 21-41 36-41s31 14 36 41" fill="#7a8fb8"/>
  <circle cx="51" cy="43" r="3" fill="#f8fafc"/>
  <circle cx="69" cy="43" r="3" fill="#f8fafc"/>
  <path d="M50 60c6 3 14 3 20 0" fill="none" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
</svg>
`);

const priscillaAvatarSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="#edd4dc"/>
  <circle cx="60" cy="45" r="25" fill="#7c1734"/>
  <path d="M22 112c6-29 22-43 38-43s32 14 38 43" fill="#b71d4b"/>
  <circle cx="51" cy="43" r="3" fill="#fff7fb"/>
  <circle cx="69" cy="43" r="3" fill="#fff7fb"/>
  <path d="M49 58c7 6 15 6 22 0" fill="none" stroke="#fff7fb" stroke-width="4" stroke-linecap="round"/>
</svg>
`);

export const alunoEmProgressoMock: AlunoDashboard = {
  id: "aluno-001",
  nome: "Priscilla Cahino",
  matricula: "xxxxxxxx",
  curso: "Assistente Administrativo",
  avatarUrl: `data:image/svg+xml,${priscillaAvatarSvg}`,
  faltas: 1,
  aulasPlanejadas: 10,
  aulasConcluidas: 4,
  progresso: 40,
};

export const alunoReprovadoPorFaltaMock: AlunoDashboard = {
  id: "aluno-002",
  nome: "Jose Santos",
  matricula: null,
  curso: "Assistente Administrativo",
  avatarUrl: `data:image/svg+xml,${joseAvatarSvg}`,
  faltas: 3,
  aulasPlanejadas: 10,
  aulasConcluidas: 3,
  progresso: 30,
};

export const alunoAprovadoMock: AlunoDashboard = {
  id: "aluno-001",
  nome: "Diego Martins",
  matricula: "xxxxxxxx",
  curso: "Assistente Administrativo",
  avatarUrl: `data:image/svg+xml,${diegoAvatarSvg}`,
  faltas: 0,
  aulasPlanejadas: 10,
  aulasConcluidas: 10,
  progresso: 100,
};

export const alunoDashboardMock = alunoEmProgressoMock;
