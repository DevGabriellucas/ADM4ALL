export interface NavItem {
  label: string;
  href: string;
  development?: boolean;
}

export const coordinatorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/coordenador/dashboard" },
  { label: "Cursos", href: "/coordenador/cursos" },
  { label: "Turmas", href: "/coordenador/turmas" },
  { label: "Alunos", href: "/coordenador/alunos" },
  { label: "Instrutores", href: "/coordenador/instrutores" },
  { label: "Certificados", href: "/coordenador/certificados" },
  { label: "Relatórios", href: "/coordenador/relatorios" },
  { label: "Usuários", href: "/coordenador/usuarios" },
  {
    label: "Configurações",
    href: "/coordenador/configuracoes",
    development: true,
  },
];
