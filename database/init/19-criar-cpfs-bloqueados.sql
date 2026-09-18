-- Lista de CPFs impedidos de criar conta pelo cadastro publico.
--
-- Quem enche esta tabela e o botao "Bloquear" da coordenacao, e so ele.
--
-- EXCLUIR UM ALUNO NAO BLOQUEIA O CPF. Ate 18/09 bloqueava: a linha ia para ca
-- antes do DELETE, e a pessoa ficava barrada para sempre no cadastro publico. A
-- coordenacao separou as duas coisas — excluir e tirar do sistema, bloquear e
-- impedir de voltar. Com as duas coladas nao havia como apagar um cadastro
-- feito por engano sem punir quem nao fez nada, e a lista acumulava CPF de
-- gente que ninguem quis bloquear.
--
-- A tabela guarda o HMAC-SHA256 do CPF, nunca o CPF. Ela nasceu em 10/09 com
-- CPF, nome e e-mail em texto puro, o que mantinha dado pessoal de quem tinha
-- sido excluido — a exclusao nao excluia. Em 18/09 nome e e-mail sairam (nao
-- bloqueiam nada) e o CPF virou hash, que responde a unica pergunta que a
-- tabela precisa responder: "este CPF esta bloqueado?".
--
-- HMAC e nao SHA-256 puro porque CPF tem ~10^9 valores possiveis: um hash sem
-- segredo seria quebrado por forca bruta e a tabela continuaria entregando os
-- CPFs de quem saiu. O segredo (CPF_HASH_SECRET) mora no ambiente do backend,
-- fora do banco, entao quem levar so o dump nao monta a tabela de comparacao.
--
-- O bloqueio vale so para o cadastro publico. A coordenacao continua podendo
-- cadastrar o mesmo CPF, e esse cadastro tira o hash desta lista — e o caminho
-- de volta para quem foi bloqueado por engano. Reativar a conta pelo botao
-- "Reativar" tem o mesmo efeito.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS cpfs_bloqueados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf_hash CHAR(64) NOT NULL,
  motivo TEXT,
  bloqueado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_bloqueio TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_cpfs_bloqueados_hash UNIQUE (cpf_hash),
  CONSTRAINT chk_cpfs_bloqueados_hash CHECK (cpf_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX IF NOT EXISTS idx_cpfs_bloqueados_data
ON cpfs_bloqueados (data_bloqueio DESC);

COMMENT ON TABLE cpfs_bloqueados IS
'CPFs impedidos de se cadastrar pelo formulario publico. Guarda apenas o HMAC-SHA256 do CPF (segredo em CPF_HASH_SECRET), nunca o CPF';

COMMENT ON COLUMN cpfs_bloqueados.cpf_hash IS
'HMAC-SHA256 dos 11 digitos do CPF, em hexadecimal. Ver backend/src/infrastructure/security/hashCpf.ts';

COMMENT ON COLUMN cpfs_bloqueados.bloqueado_por_id IS
'Quem bloqueou o aluno. Fica NULL se esse usuario for excluido depois';
