-- Aplicar com:
--   Get-Content .\database\migrations\20260910_encerrar_turmas_concluidas.sql | docker compose exec -T db psql -U adm4all -d adm4all
--
-- A turma passou a encerrar sozinha quando o curso acaba (todas as aulas nao
-- canceladas realizadas), no lugar do botao "Encerrar turma" que a coordenacao
-- tinha. A regra nova so dispara quando alguma aula muda de status, entao as
-- turmas que ja terminaram antes desta mudanca ficariam "em andamento" para
-- sempre. Este UPDATE acerta o passado uma unica vez.

-- A condicao abaixo repete `cursoConcluido()`, em
-- backend/src/infrastructure/repositories/sql/turma.ts. Sem a ultima clausula,
-- esta migration encerraria turma com uma unica aula realizada — que era o
-- comportamento antigo, corrigido depois porque formava a turma inteira e
-- emitia certificado na semana 1. O 10 e AULAS_POR_PERIODO; se aquele valor
-- mudar, muda aqui tambem.
UPDATE turmas t
SET status = 'encerrada'
WHERE t.status IN ('planejada', 'em_andamento')
  AND EXISTS (
    SELECT 1 FROM aulas a
    WHERE a.turma_id = t.id AND a.status <> 'cancelada'
  )
  AND NOT EXISTS (
    SELECT 1 FROM aulas a
    WHERE a.turma_id = t.id
      AND a.status NOT IN ('realizada', 'cancelada')
  )
  AND (
    (
      SELECT COUNT(*) FROM aulas a
      WHERE a.turma_id = t.id AND a.status <> 'cancelada'
    ) >= 10
    OR t.data_fim < CURRENT_DATE
  );
