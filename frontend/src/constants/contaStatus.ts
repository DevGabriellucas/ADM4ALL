import type { UserStatus } from "@/types/coordinator";

// Tons do CoordinatorStatusBadge. Os mesmos das tabelas de turmas e de
// matriculas, para o mesmo estado nao mudar de cor entre as telas da
// coordenacao.
export type ContaStatusTone = "green" | "amber" | "red";

// "Inativo" era o rotulo desta situacao em cada tabela, com uma redacao
// diferente por tela. A conta desativada e a mesma coisa em aluno, instrutor e
// coordenador, entao o rotulo tambem e um so.
export const contaStatusLabel: Record<UserStatus, string> = {
  ativo: "Ativo",
  pendente_ativacao: "Pendente de ativação",
  inativo: "Desativado",
  bloqueado: "Bloqueado",
};

// As mesmas cores da tabela de turmas: verde para quem esta valendo, ambar para
// o que ainda nao comecou e vermelho para o que foi interrompido — como
// "Cancelada" e "Encerrada" ja eram la. Desativado saiu do cinza porque, numa
// coluna de pastilhas claras, ele se perdia entre as outras.
export const contaStatusTone: Record<UserStatus, ContaStatusTone> = {
  ativo: "green",
  pendente_ativacao: "amber",
  inativo: "red",
  bloqueado: "red",
};

export const getContaStatusInfo = (status: UserStatus) => ({
  label: contaStatusLabel[status],
  tone: contaStatusTone[status],
});
