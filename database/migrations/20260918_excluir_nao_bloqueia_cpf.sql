-- Tira da lista de bloqueio os CPFs que entraram por EXCLUSAO de aluno.
--
-- Ate 18/09/2026 excluir um aluno mandava o CPF dele para `cpfs_bloqueados`
-- automaticamente. A coordenacao separou as duas coisas: excluir e tirar do
-- sistema, bloquear e impedir de voltar, e quem decide bloquear passou a ser
-- so o botao "Bloquear". O codigo que fazia isso saiu junto
-- (`bloquearCpfExcluido`, em PostgresCoordenadorRepository).
--
-- As linhas ja gravadas continuariam barrando gente que ninguem quis bloquear,
-- por uma regra que nao existe mais. Elas saem aqui.
--
-- O `motivo` e o que separa as duas origens: quem veio do botao ficou com
-- "Aluno bloqueado pela coordenacao" e NAO e tocado por esta migration. Se
-- algum dos CPFs abaixo precisar mesmo ficar bloqueado, a coordenacao bloqueia
-- pelo botao — o caminho que passou a valer.
--
-- ATENCAO: isto LIBERA pessoas para se cadastrarem de novo pelo formulario
-- publico. E o efeito pretendido, mas nao tem desfazer: o CPF de origem nao
-- existe mais em lugar nenhum (a tabela so guarda hash), entao nao da para
-- recolocar a linha depois.
--
-- Aplicar com:
--   Get-Content .\database\migrations\20260918_excluir_nao_bloqueia_cpf.sql |
--     docker compose exec -T db psql -U adm4all -d adm4all

BEGIN;

DELETE FROM cpfs_bloqueados
WHERE motivo = 'Aluno excluido pela coordenacao';

COMMENT ON COLUMN cpfs_bloqueados.bloqueado_por_id IS
'Quem bloqueou o aluno. Fica NULL se esse usuario for excluido depois';

COMMIT;

-- Conferencia: so devem sobrar bloqueios vindos do botao.
SELECT motivo, COUNT(*) AS linhas
FROM cpfs_bloqueados
GROUP BY motivo
ORDER BY motivo;
