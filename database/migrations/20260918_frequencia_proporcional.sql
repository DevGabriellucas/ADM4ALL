-- Aplicar com:
--   Get-Content .\database\migrations\20260918_frequencia_proporcional.sql | docker compose exec -T db psql -U adm4all -d adm4all
--
-- A frequencia virou proporcao: creditos (presenca e justificada) sobre
-- chamadas lancadas. Cinco presencas em dez chamadas eram 0% e passam a ser
-- 50%, porque a falta deixou de custar dois passos (nao somar e ainda
-- descontar).
--
-- O status da matricula e o certificado foram gravados com a conta antiga e
-- nao se corrigem sozinhos: eles so sao revistos quando alguma chamada ou aula
-- muda. Este script roda a mesma reavaliacao do sistema uma vez, com a conta
-- nova, e acerta o certificado em seguida. Os numeros 70 e 80 sao
-- FREQUENCIA_MAXIMA_REPROVACAO e FREQUENCIA_MINIMA_APROVACAO, em
-- backend/src/domain/regras-academicas.ts.

BEGIN;

WITH situacao AS (
  SELECT
    m.id,
    m.turma_id,
    -- Espelha frequenciaPorMatricula(): creditos sobre chamadas, ignorando
    -- lancamento de aula cancelada.
    COUNT(f.id) FILTER (
      WHERE (f.presente OR f.justificada)
        AND NOT EXISTS (
          SELECT 1 FROM aulas ac
          WHERE ac.id = f.aula_id AND ac.status = 'cancelada'
        )
    ) AS creditos,
    COUNT(f.id) FILTER (
      WHERE NOT EXISTS (
        SELECT 1 FROM aulas ac
        WHERE ac.id = f.aula_id AND ac.status = 'cancelada'
      )
    ) AS chamadas
  FROM matriculas m
  LEFT JOIN frequencias f ON f.matricula_id = m.id
  WHERE m.status <> 'cancelado'
  GROUP BY m.id, m.turma_id
),
avaliada AS (
  SELECT
    s.id,
    s.chamadas,
    CASE
      WHEN s.chamadas > 0
        THEN LEAST(100, GREATEST(0, ROUND((s.creditos::numeric * 100) / s.chamadas)))
      ELSE 0
    END AS frequencia,
    (
      SELECT (
        COUNT(au.id) FILTER (WHERE au.status <> 'cancelada') > 0
        AND COUNT(au.id) FILTER (WHERE au.status <> 'cancelada')
            = COUNT(au.id) FILTER (WHERE au.status = 'realizada')
      )
      FROM turmas tu
      LEFT JOIN aulas au ON au.turma_id = tu.id
      WHERE tu.id = s.turma_id
      GROUP BY tu.id
    ) AS curso_concluido
  FROM situacao s
),
destino AS (
  SELECT
    a.id,
    CASE
      WHEN a.curso_concluido AND a.chamadas > 0 AND a.frequencia >= 80
        THEN 'aprovado'
      WHEN a.curso_concluido AND a.frequencia <= 70
        THEN 'reprovado_falta'
      ELSE 'em_andamento'
    END AS status
  FROM avaliada a
)
UPDATE matriculas m
SET
  status = d.status,
  data_conclusao = CASE
    WHEN d.status IN ('aprovado', 'reprovado_falta') THEN CURRENT_DATE
    ELSE NULL
  END
FROM destino d
WHERE m.id = d.id
  AND m.status <> 'cancelado'
  AND m.status <> d.status;

-- Quem passou a ser aprovado ganha certificado; quem deixou de ser tem o dele
-- cancelado. Mesma regra de sincronizarCertificados(), inclusive o cuidado de
-- nao trocar o codigo de um certificado ja emitido.
INSERT INTO certificados
  (matricula_id, codigo, status, data_emissao, emitido_por_id, observacao)
SELECT
  m.id,
  'CERT-ALU-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' ||
    UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FOR 8)),
  'emitido',
  CURRENT_DATE,
  NULL,
  'Certificado emitido automaticamente ao concluir o curso.'
FROM matriculas m
WHERE m.status = 'aprovado'
ON CONFLICT (matricula_id) DO UPDATE SET
  status = 'emitido',
  data_emissao = CURRENT_DATE,
  url_arquivo = NULL,
  observacao = 'Certificado reemitido automaticamente ao concluir o curso.'
WHERE certificados.status <> 'emitido';

UPDATE certificados c
SET
  status = 'cancelado',
  observacao = 'Certificado cancelado automaticamente: o aluno deixou de atender aos criterios.'
FROM matriculas m
WHERE m.id = c.matricula_id
  AND m.status <> 'aprovado'
  AND c.status <> 'cancelado';

COMMIT;

SELECT m.status, COUNT(*) FROM matriculas m GROUP BY m.status;
