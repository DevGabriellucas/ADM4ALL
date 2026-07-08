-- Migra banco existente para permitir multiplos instrutores por turma.
-- Rode uma vez antes de subir a versao que usa turma_instrutores.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS turma_instrutores (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id        UUID         NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    instrutor_id    UUID         NOT NULL REFERENCES instrutores(id) ON DELETE CASCADE,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uq_turma_instrutor UNIQUE (turma_id, instrutor_id)
);

CREATE INDEX IF NOT EXISTS idx_turma_instrutores_turma
    ON turma_instrutores (turma_id);

CREATE INDEX IF NOT EXISTS idx_turma_instrutores_instrutor
    ON turma_instrutores (instrutor_id);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'turmas'
          AND column_name = 'instrutor_id'
    ) THEN
        INSERT INTO turma_instrutores (turma_id, instrutor_id)
        SELECT id, instrutor_id
        FROM turmas
        WHERE instrutor_id IS NOT NULL
        ON CONFLICT (turma_id, instrutor_id) DO NOTHING;
    END IF;
END $$;
