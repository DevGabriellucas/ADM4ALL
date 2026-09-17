-- Migration para bancos que ja existem (o script equivalente em
-- database/init/19-criar-cpfs-bloqueados.sql so roda na primeira criacao do
-- volume).
--
-- Aplicar com:
--   Get-Content .\database\migrations\20260910_cpfs_bloqueados.sql | docker compose exec -T db psql -U adm4all -d adm4all
--
-- Lista de CPFs impedidos de criar conta pelo cadastro publico, alimentada
-- quando a coordenacao exclui um aluno. Sem ela, a exclusao nao impediria a
-- mesma pessoa de se cadastrar de novo no minuto seguinte.

CREATE TABLE IF NOT EXISTS cpfs_bloqueados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf VARCHAR(11) NOT NULL UNIQUE,
  nome VARCHAR(255),
  email VARCHAR(255),
  motivo TEXT,
  bloqueado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_bloqueio TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_cpfs_bloqueados_digitos CHECK (cpf ~ '^[0-9]{11}$')
);

CREATE INDEX IF NOT EXISTS idx_cpfs_bloqueados_data
ON cpfs_bloqueados (data_bloqueio DESC);

COMMENT ON TABLE cpfs_bloqueados IS
'CPFs impedidos de se cadastrar pelo formulario publico, alimentada pela exclusao de aluno';

COMMENT ON COLUMN cpfs_bloqueados.bloqueado_por_id IS
'Quem excluiu o aluno. Fica NULL se esse usuario for excluido depois';
