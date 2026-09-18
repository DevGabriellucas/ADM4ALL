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
 * Periodo do curso segundo o CRONOGRAMA: a primeira e a ultima aula nao
 * cancelada da turma.
 *
 * E o que o certificado precisa imprimir. `turmas.data_inicio` e
 * `turmas.data_fim` sao a previsao digitada quando a turma foi criada, e a
 * turma so encerra quando o cronograma acaba (ver cursoConcluido). Com as duas
 * datas vindas da previsao, um aluno que terminou em outubro recebia um
 * certificado dizendo "ate 15 de dezembro de 2026".
 *
 * Aulas canceladas ficam de fora pelo mesmo motivo que ficam de fora do
 * progresso: elas nao aconteceram, entao nao abrem nem fecham o periodo.
 *
 * Devolve subconsultas escalares — podem dar NULL quando a turma ainda nao tem
 * cronograma, e quem chama faz o COALESCE para as datas previstas da turma.
 *
 * O apelido e literal escrito na propria consulta, nunca entrada de usuario.
 */
export function periodoDoCronograma(aliasTurma: string): {
  inicio: string;
  fim: string;
} {
  const agregado = (funcao: "MIN" | "MAX") => `(
    SELECT ${funcao}(aula_cronograma.data_aula)
    FROM aulas aula_cronograma
    WHERE aula_cronograma.turma_id = ${aliasTurma}.id
      AND aula_cronograma.status <> 'cancelada'
  )`;

  return { inicio: agregado("MIN"), fim: agregado("MAX") };
}

/**
 * UPDATE que reaplica o status derivado de UMA turma, recebida em `$1`.
 *
 * O status da turma nao e digitado, e calculado. A regra, em ordem:
 *
 * 1. Todas as aulas nao canceladas realizadas (progresso em 100%)
 *    -> "encerrada".
 * 2. Senao, com pelo menos um aluno matriculado -> "em_andamento".
 * 3. Senao (turma vazia) -> "planejada".
 *
 * O destino do passo 1 era "concluida" ate 18/09. As duas palavras significavam
 * a mesma coisa no sistema — o proprio backend ja as tratava como sinonimos em
 * certificado e relatorio — e a coordenacao escolheu ficar com "Encerrada", que
 * e como a turma aparece na tela. "concluida" segue no CHECK da tabela por
 * causa das turmas antigas, mas nenhuma turma nova chega nele.
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
          WHEN s.concluida THEN 'encerrada'
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
