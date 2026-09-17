import { AULAS_POR_PERIODO } from "../../../domain/regras-academicas";

// Condicao de "curso concluido".
//
// Mora aqui porque DUAS decisoes dependem dela e precisam concordar: aprovar as
// matriculas e encerrar a turma. Enquanto a condicao estava escrita duas vezes,
// bastava corrigir uma para a turma ficar "em andamento" com os alunos ja
// aprovados, ou o contrario.
//
// A turma fecha quando todas as aulas nao canceladas estao realizadas E ela ja
// tem o bloco completo de aulas do periodo. Sem essa segunda parte, a primeira
// aula marcada como realizada satisfazia "todas realizadas" sozinha e formava a
// turma inteira na semana 1, emitindo certificado com codigo real.
//
// A data de termino prevista e a saida para a turma mais curta que um bloco:
// sem ela, uma turma de oito aulas nunca poderia fechar.
//
// Os apelidos sao literais escritos nas proprias consultas, nunca entrada de
// usuario.
export function cursoConcluido(aliasAula: string, aliasTurma: string): string {
  const naoCanceladas = `COUNT(${aliasAula}.id) FILTER (
    WHERE ${aliasAula}.status <> 'cancelada'
  )`;
  const realizadas = `COUNT(${aliasAula}.id) FILTER (
    WHERE ${aliasAula}.status = 'realizada'
  )`;

  return `(
    ${naoCanceladas} > 0
    AND ${naoCanceladas} = ${realizadas}
    AND (
      ${naoCanceladas} >= ${AULAS_POR_PERIODO}
      OR ${aliasTurma}.data_fim < CURRENT_DATE
    )
  )`;
}
