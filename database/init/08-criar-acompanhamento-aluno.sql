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

CREATE TABLE IF NOT EXISTS avaliacoes (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_id   UUID          NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    aula_id        UUID          REFERENCES aulas(id) ON DELETE SET NULL,
    descricao      VARCHAR(120)  NOT NULL,
    nota           NUMERIC(4, 2)  NOT NULL,
    data_avaliacao DATE          NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT chk_avaliacoes_descricao_nao_vazia
        CHECK (length(trim(descricao)) > 0),
    CONSTRAINT chk_avaliacoes_nota_intervalo
        CHECK (nota BETWEEN 0 AND 10)
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_matricula
    ON avaliacoes (matricula_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_aula
    ON avaliacoes (aula_id);

CREATE TABLE IF NOT EXISTS documentos_aluno (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id       UUID         NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    tipo           VARCHAR(80)  NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'pendente',
    data_envio     DATE,
    data_validacao DATE,
    observacao     TEXT,

    CONSTRAINT uq_documentos_aluno_tipo
        UNIQUE (aluno_id, tipo),
    CONSTRAINT chk_documentos_tipo_nao_vazio
        CHECK (length(trim(tipo)) > 0),
    CONSTRAINT chk_documentos_status
        CHECK (status IN ('pendente', 'enviado', 'aprovado', 'recusado')),
    CONSTRAINT chk_documentos_datas
        CHECK (data_validacao IS NULL OR data_envio IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_documentos_aluno
    ON documentos_aluno (aluno_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status
    ON documentos_aluno (status);
