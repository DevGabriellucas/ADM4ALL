-- Separa falta justificada de falta simples na tabela de frequencias.
--
-- Antes desta coluna a justificativa era inferida por observacao IS NOT NULL,
-- entao qualquer anotacao escrita numa falta virava "falta justificada" e,
-- pior, o painel do aluno contava as duas do mesmo jeito: quem justificou a
-- ausencia continuava vendo a falta no cartao.

ALTER TABLE frequencias
ADD COLUMN IF NOT EXISTS justificada BOOLEAN NOT NULL DEFAULT FALSE;

-- Mantem o comportamento anterior para o que ja estava gravado: falta com
-- observacao era exibida como justificada nas telas do instrutor.
UPDATE frequencias
SET justificada = TRUE
WHERE presente = FALSE
  AND observacao IS NOT NULL
  AND justificada = FALSE;

-- Uma presenca justificada e uma presenca creditada: ela aparece como
-- "Justificada" na chamada, mas nao conta como falta.
ALTER TABLE frequencias
DROP CONSTRAINT IF EXISTS chk_frequencias_justificada;

-- Indice para a contagem que alimenta faltas e progresso do aluno.
CREATE INDEX IF NOT EXISTS idx_frequencias_falta_contabilizada
ON frequencias (matricula_id)
WHERE presente = FALSE AND justificada = FALSE;

COMMENT ON COLUMN frequencias.justificada IS
'Falta justificada e aceita: nao conta como falta nem desconta progresso do aluno';
