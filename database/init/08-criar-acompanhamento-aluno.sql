-- Acompanhamento academico e documental do aluno.

CREATE TABLE IF NOT EXISTS frequencias (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_id   UUID        NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    aula_id        UUID        REFERENCES aulas(id) ON DELETE CASCADE,
    data_aula      DATE        NOT NULL,
    presente       BOOLEAN     NOT NULL,
    observacao     TEXT,
    data_registro  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_frequencias_matricula_data
        UNIQUE (matricula_id, data_aula)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_frequencias_matricula_aula
    ON frequencias (matricula_id, aula_id)
    WHERE aula_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_frequencias_matricula
    ON frequencias (matricula_id);
CREATE INDEX IF NOT EXISTS idx_frequencias_aula
    ON frequencias (aula_id);

-- As tabelas avaliacoes e documentos_aluno foram removidas em 18/09/2026: eram
-- criadas aqui e nenhuma linha de codigo as lia ou escrevia. Banco que ja
-- existe usa migrations/20260918_remover_tabelas_sem_uso.sql.
