// Trechos de SQL da regra de frequencia. Existem para que a conta tenha UMA
// escrita: ela ja esteve colada em catorze consultas e derivou em quatro
// versoes diferentes, fazendo a mesma falta aparecer como 90% no painel do
// aluno e 50% no card de risco da coordenacao.
//
// Os apelidos recebidos aqui sao sempre literais escritos no proprio codigo das
// consultas, nunca entrada de usuario.

/**
 * Chamada que ainda vale: a de uma aula que nao foi cancelada.
 *
 * Aula cancelada nao aconteceu, entao nem a presenca nem a falta lancadas nela
 * podem pesar no desfecho do aluno — a presenca dava credito por uma aula que
 * ninguem teve, e a falta punia por nao comparecer a uma aula desmarcada.
 *
 * `aula_id` e anulavel (linhas antigas, anteriores ao vinculo com a aula): sem
 * aula para consultar, o NOT EXISTS da verdadeiro e a chamada continua valendo,
 * que e o comportamento certo — nao ha aula cancelada para desqualifica-la.
 *
 * O custo e uma busca por chave primaria em `aulas` por linha de frequencia.
 * A alternativa era um JOIN em cada uma das consultas que usam estes helpers,
 * e foi exatamente esse tipo de repeticao que produziu quatro versoes
 * divergentes da regra de frequencia.
 */
export function chamadaValida(alias: string): string {
  return `NOT EXISTS (
    SELECT 1
    FROM aulas aula_da_chamada
    WHERE aula_da_chamada.id = ${alias}.aula_id
      AND aula_da_chamada.status = 'cancelada'
  )`;
}

// Falta que conta contra o aluno. A justificada fica de fora por definicao.
export function faltasNaoJustificadas(alias: string): string {
  return `COUNT(${alias}.id) FILTER (
    WHERE NOT ${alias}.presente
      AND NOT ${alias}.justificada
      AND ${chamadaValida(alias)}
  )`;
}

// Presenca de verdade, sem a justificada.
//
// A justificada e gravada com presente = TRUE (decisao de 16/09: ela recebe
// credito de presenca). Um COUNT FILTER (presente) puro passa a contar a mesma
// linha duas vezes, uma em "Presencas" e outra em "Justificadas", e as colunas
// da tela param de fechar com o total de chamadas.
//
// Qualificar com NOT justificada tambem le corretamente as linhas antigas,
// gravadas como presente = FALSE antes daquela decisao.
export function presencasEfetivas(alias: string): string {
  return `COUNT(${alias}.id) FILTER (
    WHERE ${alias}.presente
      AND NOT ${alias}.justificada
      AND ${chamadaValida(alias)}
  )`;
}

// Chamada que soma frequencia: presenca e justificada valem o mesmo.
//
// O OR le as duas gravacoes da justificada — a atual, com presente = TRUE, e as
// linhas antigas, com presente = FALSE.
export function creditosDeFrequencia(alias: string): string {
  return `COUNT(${alias}.id) FILTER (
    WHERE (${alias}.presente OR ${alias}.justificada)
      AND ${chamadaValida(alias)}
  )`;
}

// Quantas chamadas valem para este aluno. Um COUNT(*) cru contaria tambem as
// lancadas em aula cancelada, e as colunas da tela parariam de fechar com a
// soma de presencas, justificadas e faltas — que ja excluem essas.
export function chamadasLancadas(alias: string): string {
  return `COUNT(${alias}.id) FILTER (WHERE ${chamadaValida(alias)})`;
}

/**
 * A conta, a partir de contagens ja calculadas: **creditos sobre chamadas**.
 *
 * Cinco presencas em dez chamadas sao 50%, que e como a frequencia se le em
 * qualquer lugar e o que bate com a lista de presencas na tela do aluno.
 *
 * Ate 18/09 a conta era `(creditos - faltas) x 10`, e a falta custava dois
 * passos: deixava de somar e ainda descontava. Aqueles mesmos cinco de dez
 * davam 0%, um numero que ninguem conseguia explicar olhando a lista. A falta
 * agora pesa uma vez so, por nao somar.
 *
 * O denominador sao as chamadas lancadas, e nao o cronograma inteiro: a
 * frequencia passa a ser estavel desde a primeira aula (quem so tem presenca
 * esta em 100%) em vez de subir devagar ate o fim do periodo, e quem entra na
 * turma no meio nao carrega falta de aula que aconteceu antes dele.
 *
 * Sem chamada nenhuma o resultado e 0, e nao 100: a divisao nao existe, e as
 * telas distinguem esse caso por `chamadasLancadas`, nunca pela frequencia.
 */
export function frequenciaDeChamadas(
  expressaoCreditos: string,
  expressaoChamadas: string,
): string {
  return `(CASE
    WHEN (${expressaoChamadas}) > 0 THEN LEAST(100, GREATEST(0,
      ROUND(((${expressaoCreditos})::numeric * 100) / (${expressaoChamadas}))
    ))
    ELSE 0
  END)::INTEGER`;
}

// Frequencia de UM aluno, para consultas agrupadas por matricula.
//
// Agrupar por turma e aplicar esta expressao soma as chamadas de todo mundo
// antes de converter, e o numero deixa de significar qualquer coisa. Quando o
// recorte e a turma, use frequenciaAgregadaPorTurma().
export function frequenciaPorMatricula(alias: string): string {
  return frequenciaDeChamadas(
    creditosDeFrequencia(alias),
    chamadasLancadas(alias),
  );
}

// Numeros de frequencia de TODAS as turmas, numa passada so. Use como CTE e
// junte por `turma_id`.
//
// Antes cada turma carregava sua propria subconsulta correlacionada, e o
// planejador varria a tabela de frequencias inteira uma vez por turma: com 50
// turmas e 15 mil lancamentos, 750 mil leituras. Dez vezes mais dados deixavam
// a listagem de turmas 62 vezes mais lenta — 2,8 ms viravam 174 ms.
//
// Devolve as duas contagens que os chamadores precisam, porque elas divergem de
// proposito: a listagem de turmas conta lancamento de matricula cancelada (para
// saber se a turma ja teve chamada), e o relatorio nao conta (porque so fala de
// quem esta na turma).
export function frequenciaAgregadaPorTurma(): string {
  return `
    SELECT
      por_aluno.turma_id,
      ROUND(AVG(por_aluno.frequencia) FILTER (WHERE NOT por_aluno.cancelada))
        AS media,
      COALESCE(SUM(por_aluno.registros), 0) AS registros,
      COALESCE(
        SUM(por_aluno.registros) FILTER (WHERE NOT por_aluno.cancelada), 0
      ) AS registros_ativos,
      COALESCE(
        SUM(por_aluno.presencas) FILTER (WHERE NOT por_aluno.cancelada), 0
      ) AS presencas_ativas
    FROM (
      SELECT
        mf.turma_id,
        mf.status = 'cancelado' AS cancelada,
        ${frequenciaPorMatricula("fr")} AS frequencia,
        ${chamadasLancadas("fr")} AS registros,
        ${presencasEfetivas("fr")} AS presencas
      FROM matriculas mf
      LEFT JOIN frequencias fr ON fr.matricula_id = mf.id
      WHERE mf.turma_id IS NOT NULL
      GROUP BY mf.id, mf.turma_id, mf.status
    ) AS por_aluno
    GROUP BY por_aluno.turma_id
  `;
}
