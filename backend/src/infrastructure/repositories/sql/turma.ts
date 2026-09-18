// Condicao de "curso concluido".
//
// Mora aqui porque DUAS decisoes dependem dela e precisam concordar: aprovar as
// matriculas e encerrar a turma. Enquanto a condicao estava escrita duas vezes,
// bastava corrigir uma para a turma ficar "em andamento" com os alunos ja
// aprovados, ou o contrario.
//
// A turma fecha quando o cronograma acaba: todas as aulas nao canceladas
// realizadas, ou seja, o progresso em 100%. E exatamente o numero que o aluno
// ve no proprio painel.
//
// Ate 18/09 havia uma trava a mais — so fechava com o bloco de
// AULAS_POR_PERIODO cumprido, ou depois da data de termino prevista. Ela
// existia porque a primeira aula marcada como realizada satisfazia "todas
// realizadas" sozinha e formava a turma inteira na semana 1. O efeito
// colateral era o painel do aluno anunciar progresso de 100% enquanto o
// sistema mantinha todo mundo em "em andamento", sem explicar por que. A
// coordenacao decidiu (18/09) que o progresso manda.
//
// O que impede a turma de um dia graduar alguem agora e a frequencia, nao a
// contagem de aulas: ela vale PESO_FREQUENCIA_POR_AULA por chamada e comeca em
// zero, entao um cronograma curto simplesmente nao alcanca os 80% da
// aprovacao. Ver a nota sobre turma curta em regras-academicas.ts.
//
// Os apelidos sao literais escritos nas proprias consultas, nunca entrada de
// usuario.
export function cursoConcluido(aliasAula: string): string {
  const naoCanceladas = `COUNT(${aliasAula}.id) FILTER (
    WHERE ${aliasAula}.status <> 'cancelada'
  )`;
  const realizadas = `COUNT(${aliasAula}.id) FILTER (
    WHERE ${aliasAula}.status = 'realizada'
  )`;

  return `(${naoCanceladas} > 0 AND ${naoCanceladas} = ${realizadas})`;
}

/**
 * UPDATE que reaplica o status derivado de UMA turma, recebida em `$1`.
 *
 * O status da turma nao e digitado, e calculado. A regra, em ordem:
 *
 * 1. Todas as aulas nao canceladas realizadas -> "concluida".
 * 2. Senao, com pelo menos um aluno matriculado -> "em_andamento".
 * 3. Senao (turma vazia) -> "planejada".
 *
 * "cancelada" fica de fora: e a unica decisao que continua sendo da
 * coordenacao, entao o automatico nunca sobrescreve nem tira a turma dela.
 *
 * Mora aqui, e nao no repositorio do instrutor, porque os dois lados mexem no
 * que ela le: o instrutor muda o status das aulas, a coordenacao matricula e
 * desvincula aluno. Escrita duas vezes, a regra ja teria divergido.
 *
 * Reversivel nos dois sentidos de proposito: desmarcar uma aula como realizada
 * devolve a turma para "em andamento", e tirar o ultimo aluno devolve para
 * "planejada". Sem isso, corrigir um clique errado exigiria SQL no banco,
 * porque o botao "Encerrar turma" saiu da tela em 2026-09-10.
 */
export function atualizarStatusDerivadoDaTurma(): string {
  return `
    WITH situacao AS (
      SELECT
        ${cursoConcluido("a")} AS concluida,
        (
          SELECT COUNT(*)
          FROM matriculas m
          WHERE m.turma_id = tu.id
            AND m.status <> 'cancelado'
        ) AS alunos
      FROM turmas tu
      LEFT JOIN aulas a ON a.turma_id = tu.id
      WHERE tu.id = $1
      GROUP BY tu.id
    ),
    destino AS (
      SELECT
        CASE
          WHEN s.concluida THEN 'concluida'
          WHEN s.alunos > 0 THEN 'em_andamento'
          ELSE 'planejada'
        END AS status
      FROM situacao s
    )
    UPDATE turmas t
    SET status = d.status
    FROM destino d
    WHERE t.id = $1
      AND t.status <> 'cancelada'
      AND t.status <> d.status
  `;
}
