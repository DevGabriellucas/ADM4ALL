// ATENCAO: modulo de uso exclusivo do servidor. Ele compoe servicos que leem
// cookies de sessao, entao so deve ser importado por Server Components.
import { getClasses } from "@/services/coordinatorService";
import { getPainelDaTurma } from "@/services/instrutorService";
import type { ClassGroup, ClassStatus } from "@/types/coordinator";
import type { TurmaDashboard } from "@/types/instrutor";

export interface TurmaWorkspace {
  /** Todas as turmas, na ordem em que o seletor as apresenta. */
  turmas: ClassGroup[];
  turmaSelecionada: ClassGroup | null;
  /** Nulo apenas quando nao existe turma cadastrada. */
  painel: TurmaDashboard | null;
}

// Turma em andamento primeiro: e a que a coordenacao abre no dia a dia. As
// encerradas e canceladas continuam na lista, no fim, para consulta.
const PESO_STATUS: Record<ClassStatus, number> = {
  em_andamento: 0,
  planejada: 1,
  concluida: 2,
  encerrada: 3,
  cancelada: 4,
};

const ordenarTurmas = (turmas: ClassGroup[]): ClassGroup[] =>
  [...turmas].sort((a, b) => {
    const peso = (PESO_STATUS[a.status] ?? 9) - (PESO_STATUS[b.status] ?? 9);
    return peso !== 0 ? peso : a.nome.localeCompare(b.nome, "pt-BR");
  });

const escolherTurma = (
  turmas: ClassGroup[],
  turmaIdSolicitada?: string,
): ClassGroup | null => {
  // So aceitamos um id que esteja na lista da coordenacao. O valor chega pela
  // query string, entao um id forjado nao pode virar consulta no banco.
  const solicitada = turmaIdSolicitada
    ? turmas.find((turma) => turma.id === turmaIdSolicitada)
    : undefined;

  return solicitada ?? turmas[0] ?? null;
};

/**
 * Carrega o contexto das telas de turma da coordenacao (Presenca, Frequencia,
 * Cronograma e Materiais): a lista do seletor, a turma escolhida e o painel
 * dela. O painel e o mesmo que o instrutor ve na turma vinculada a ele.
 */
export const carregarWorkspaceDaTurma = async (
  turmaIdSolicitada?: string,
): Promise<TurmaWorkspace> => {
  const turmas = ordenarTurmas(await getClasses());
  const turmaSelecionada = escolherTurma(turmas, turmaIdSolicitada);

  return {
    turmas,
    turmaSelecionada,
    painel: turmaSelecionada
      ? await getPainelDaTurma(turmaSelecionada.id)
      : null,
  };
};
