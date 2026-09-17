-- Lista de CPFs impedidos de criar conta pelo cadastro publico.
--
-- Quando a coordenacao exclui um aluno, o usuario e apagado do banco e o
-- historico vai junto (as chaves estrangeiras sao ON DELETE CASCADE). Sem
-- guardar o CPF em algum lugar, a mesma pessoa se cadastraria de novo no
-- minuto seguinte e o "excluir" nao significaria nada.
--
-- O bloqueio vale so para o cadastro publico. A coordenacao continua podendo
-- cadastrar o mesmo CPF, e esse cadastro tira o CPF desta lista — e o caminho
-- de volta para quem foi excluido por engano.

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
