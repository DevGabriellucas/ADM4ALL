export interface NavItem {
  label: string;
  href: string;
}

export const coordinatorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/coordenador/dashboard" },
  { label: "Cursos", href: "/coordenador/cursos" },
  { label: "Turmas", href: "/coordenador/turmas" },

  // Mesmas secoes do instrutor, na mesma ordem, logo abaixo de Turmas: aqui
  // elas valem para qualquer turma, escolhida no seletor de cada tela.
  { label: "Presença", href: "/coordenador/presenca" },
  { label: "Frequência", href: "/coordenador/frequencia" },
  { label: "Cronograma", href: "/coordenador/cronograma" },
  { label: "Materiais", href: "/coordenador/materiais" },

  { label: "Alunos", href: "/coordenador/alunos" },
  { label: "Instrutores", href: "/coordenador/instrutores" },
  { label: "Certificados", href: "/coordenador/certificados" },
  { label: "Relatórios", href: "/coordenador/relatorios" },
  { label: "Usuários", href: "/coordenador/usuarios" },
  { label: "Configurações", href: "/coordenador/configuracoes" },
  { label: "Perfil", href: "/coordenador/perfil" },
];
