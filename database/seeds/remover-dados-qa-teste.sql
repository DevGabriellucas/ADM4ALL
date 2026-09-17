-- Remove o cenario temporario usado para validar faltas/progresso/aulas/status.
-- Apaga o aluno de teste, o instrutor de teste e a turma QA-TESTE-01 (com as
-- aulas, matriculas e frequencias ligadas a ela por ON DELETE CASCADE).
--
-- Aplicar com:
--   Get-Content .\database\seeds\remover-dados-qa-teste.sql | docker compose exec -T db psql -U adm4all -d adm4all

BEGIN;

DELETE FROM turmas WHERE codigo = 'QA-TESTE-01';

DELETE FROM usuarios
WHERE email IN (
  'aluno.teste.qa@adm4all.edu.br',
  'instrutor.teste.qa@adm4all.edu.br'
);

COMMIT;

-- Conferencia: as tres contagens devem voltar zeradas.
SELECT
  (SELECT COUNT(*) FROM turmas WHERE codigo = 'QA-TESTE-01') AS turmas_qa,
  (SELECT COUNT(*) FROM usuarios WHERE email LIKE '%.teste.qa@%') AS usuarios_qa,
  (SELECT COUNT(*) FROM alunos) AS alunos_restantes;
