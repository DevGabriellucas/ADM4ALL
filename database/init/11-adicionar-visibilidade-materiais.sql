-- Adiciona coluna de visibilidade para alunos na tabela materiais.

ALTER TABLE materiais
ADD COLUMN IF NOT EXISTS visivel_aluno BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_materiais_visivel_aluno
ON materiais (turma_id, visivel_aluno)
WHERE status = 'ativo';
