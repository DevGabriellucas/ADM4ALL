import type { CourseStatus } from "@/types/coordinator";

// Subconjunto dos tons do CoordinatorStatusBadge, os mesmos que a tabela de
// turmas usa: "Em planejamento" le como a turma "Planejada" (amber) e
// "Desativado" como a turma "Cancelada" (red), para o mesmo estado nao
// aparecer de duas cores em telas vizinhas.
export type CourseStatusTone = "green" | "amber" | "red";

export const cursoStatusLabel: Record<CourseStatus, string> = {
  ativo: "Ativo",
  em_planejamento: "Em planejamento",
  encerrado: "Encerrado",
  desativado: "Desativado",
};

export const cursoStatusTone: Record<CourseStatus, CourseStatusTone> = {
  ativo: "green",
  em_planejamento: "amber",
  // Encerrado e desativado sao vermelhos pelo mesmo motivo: nos dois casos o
  // curso parou de correr — num porque as turmas chegaram ao fim, no outro
  // porque foram canceladas.
  encerrado: "red",
  desativado: "red",
};

// O status do curso vem calculado do servidor a partir das turmas: sem turma
// com aluno ele fica em planejamento, com aluno matriculado fica ativo, com
// todas as turmas no fim do cronograma fica encerrado e com todas canceladas
// fica desativado. A coordenacao nao escolhe.
export const getCursoStatusInfo = (status: CourseStatus) => ({
  label: cursoStatusLabel[status] ?? cursoStatusLabel.em_planejamento,
  tone: cursoStatusTone[status] ?? cursoStatusTone.em_planejamento,
});
