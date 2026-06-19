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

export const alunoDashboardMock: AlunoDashboard = {
  id: "aluno-001",
  nome: "Diego Martins",
  matricula: "xxxxxxxx",
  curso: "Assistente Administrativo",
  avatarUrl: `data:image/svg+xml,${diegoAvatarSvg}`,
  faltas: 0,
  progresso: 100,
  notas: "Disponíveis na plataforma",
  documentosPendentes: "Nenhum pendente",
};
