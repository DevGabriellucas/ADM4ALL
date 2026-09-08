-- Atualiza os dados de contato da instituicao em um banco JA EXISTENTE.
--
-- O script 13-inserir-configuracoes-padrao.sql usa ON CONFLICT DO NOTHING,
-- entao ele so grava esses valores num banco novo. Em banco ja criado, rode
-- este UPDATE:
--
--   docker compose exec -T db psql -U adm4all -d adm4all < database/seeds/producao/atualizar-dados-instituicao.sql

BEGIN;

UPDATE configuracoes_sistema SET valor = 'unipeadm4all@gmail.com', atualizado_em = NOW()
 WHERE chave = 'instituicao_email';

UPDATE configuracoes_sistema SET valor = '(83) 98871-6106', atualizado_em = NOW()
 WHERE chave = 'instituicao_telefone';

COMMIT;

-- Conferencia
SELECT chave, valor
  FROM configuracoes_sistema
 WHERE chave LIKE 'instituicao_%'
 ORDER BY chave;
