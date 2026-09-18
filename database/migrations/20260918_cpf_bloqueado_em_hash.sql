-- `cpfs_bloqueados` para de guardar dado pessoal em texto puro.
--
-- A tabela existe para impedir que quem foi excluido se recadastre pelo
-- formulario publico. Ate aqui ela guardava CPF, nome e e-mail, para sempre,
-- DEPOIS de a pessoa ter sido apagada do sistema — a exclusao nao excluia.
--
-- Nome e e-mail nao bloqueiam nada e saem. O CPF vira HMAC-SHA256, que responde
-- a unica pergunta que a tabela precisa responder: "este CPF esta bloqueado?".
--
-- HMAC e nao SHA-256 puro porque CPF tem ~10^9 valores possiveis: um hash sem
-- segredo seria quebrado por forca bruta e a tabela continuaria entregando os
-- CPFs. O segredo (CPF_HASH_SECRET) mora no ambiente do backend, nao no banco.
--
-- ATENCAO — como rodar: o segredo precisa ser o MESMO que o backend usa, senao
-- os bloqueios ja gravados param de bater. Passe em `-v pepper=...`:
--
--   Get-Content .\database\migrations\20260918_cpf_bloqueado_em_hash.sql |
--     docker compose exec -T db psql -U adm4all -d adm4all -v pepper="$env:CPF_HASH_SECRET"
--
-- Sem a variavel o psql para em "pepper is not defined", que e o que se quer:
-- rodar sem o segredo certo apagaria os bloqueios em silencio.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Leva a variavel do psql para dentro da sessao, onde o bloco DO consegue ler.
SET adm4all.pepper = :'pepper';

ALTER TABLE cpfs_bloqueados
  ADD COLUMN IF NOT EXISTS cpf_hash CHAR(64);

-- Converte o que ja esta gravado. So roda enquanto a coluna antiga existir,
-- para a migration poder ser aplicada de novo sem erro.
--
-- O segredo entra por USING, e nao concatenado no texto da consulta: assim ele
-- nao aparece em log de statement.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cpfs_bloqueados' AND column_name = 'cpf'
  ) THEN
    EXECUTE
      'UPDATE cpfs_bloqueados
          SET cpf_hash = encode(hmac(cpf, $1, ''sha256''), ''hex'')
        WHERE cpf_hash IS NULL'
      USING current_setting('adm4all.pepper');
  END IF;
END
$$;

-- Linha sem CPF de origem e sem hash nao bloqueia ninguem: sai.
DELETE FROM cpfs_bloqueados WHERE cpf_hash IS NULL;

ALTER TABLE cpfs_bloqueados DROP CONSTRAINT IF EXISTS chk_cpfs_bloqueados_digitos;
ALTER TABLE cpfs_bloqueados DROP COLUMN IF EXISTS cpf;
ALTER TABLE cpfs_bloqueados DROP COLUMN IF EXISTS nome;
ALTER TABLE cpfs_bloqueados DROP COLUMN IF EXISTS email;

ALTER TABLE cpfs_bloqueados ALTER COLUMN cpf_hash SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_cpfs_bloqueados_hash'
  ) THEN
    ALTER TABLE cpfs_bloqueados
      ADD CONSTRAINT uq_cpfs_bloqueados_hash UNIQUE (cpf_hash);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_cpfs_bloqueados_hash'
  ) THEN
    ALTER TABLE cpfs_bloqueados
      ADD CONSTRAINT chk_cpfs_bloqueados_hash CHECK (cpf_hash ~ '^[0-9a-f]{64}$');
  END IF;
END
$$;

COMMENT ON TABLE cpfs_bloqueados IS
'CPFs impedidos de se cadastrar pelo formulario publico. Guarda apenas o HMAC-SHA256 do CPF (segredo em CPF_HASH_SECRET), nunca o CPF';

COMMENT ON COLUMN cpfs_bloqueados.cpf_hash IS
'HMAC-SHA256 dos 11 digitos do CPF, em hexadecimal. Ver backend/src/infrastructure/security/hashCpf.ts';
