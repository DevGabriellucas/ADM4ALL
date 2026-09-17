-- Migration para bancos que ja existem (o script equivalente em
-- database/init/17-adicionar-justificativa-frequencia.sql so roda na primeira
-- criacao do volume).
--
-- Aplicar com:
--   Get-Content .\database\migrations\20260908_frequencia_justificada.sql | docker compose exec -T db psql -U adm4all -d adm4all
--
-- Separa falta justificada de falta simples: antes a justificativa era
-- inferida por observacao IS NOT NULL e o painel do aluno contava as duas
-- igualmente, entao quem justificava continuava com a falta no cartao.

ALTER TABLE frequencias
ADD COLUMN IF NOT EXISTS justificada BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE frequencias
SET justificada = TRUE
WHERE presente = FALSE
  AND observacao IS NOT NULL
  AND justificada = FALSE;

ALTER TABLE frequencias
DROP CONSTRAINT IF EXISTS chk_frequencias_justificada;

ALTER TABLE frequencias
ADD CONSTRAINT chk_frequencias_justificada
CHECK (NOT (presente AND justificada));

CREATE INDEX IF NOT EXISTS idx_frequencias_falta_contabilizada
ON frequencias (matricula_id)
WHERE presente = FALSE AND justificada = FALSE;

COMMENT ON COLUMN frequencias.justificada IS
'Falta justificada e aceita: nao conta como falta nem desconta progresso do aluno';
