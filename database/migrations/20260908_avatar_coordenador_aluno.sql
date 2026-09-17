-- Foto de perfil para coordenador e aluno, como ja existia para instrutor.
--
-- Aplicar com:
--   Get-Content .\database\migrations\20260908_avatar_coordenador_aluno.sql | docker compose exec -T db psql -U adm4all -d adm4all

ALTER TABLE coordenadores
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);

ALTER TABLE alunos
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);

COMMENT ON COLUMN coordenadores.avatar_url IS
'Caminho da foto de perfil servida pelo backend (/uploads/avatares/...)';

COMMENT ON COLUMN alunos.avatar_url IS
'Caminho da foto de perfil servida pelo backend (/uploads/avatares/...)';
