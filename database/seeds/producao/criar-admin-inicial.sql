-- Cria o administrador inicial de um banco novo.
--
-- Este script NAO roda automaticamente: ele fica fora de database/init/ de
-- proposito, para nenhuma instalacao nascer com conta de senha conhecida.
-- Leia database/seeds/producao/README.md antes de usar.
--
-- ATENCAO ao preencher:
--   * o CPF precisa ser valido (o sistema confere o digito verificador);
--   * o e-mail precisa ser real, porque e por ele que passa a recuperacao
--     de senha;
--   * SENHA_HASH_AQUI e o hash bcrypt, nunca a senha em texto. Gere com:
--       cd backend
--       node -e "console.log(require('bcrypt').hashSync('SUA_SENHA', 10))"

BEGIN;

INSERT INTO usuarios (perfil_id, nome, email, cpf, senha, status)
SELECT
    p.id,
    'NOME_COMPLETO_AQUI',
    'email@instituicao.edu.br',
    'CPF_SOMENTE_NUMEROS',
    'SENHA_HASH_AQUI',
    'ativo'
FROM perfis p
WHERE p.nome = 'admin'
ON CONFLICT DO NOTHING;

COMMIT;

-- Conferencia
SELECT u.nome, u.email, p.nome AS perfil, u.status
  FROM usuarios u
  JOIN perfis p ON p.id = u.perfil_id
 ORDER BY u.nome;
