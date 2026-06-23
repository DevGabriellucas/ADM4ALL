-- Matriculas dos alunos e cronograma de aulas.

CREATE TABLE IF NOT EXISTS matriculas (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id        UUID        NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    treinamento_id  UUID        NOT NULL REFERENCES treinamentos(id) ON DELETE RESTRICT,
    turma_id        UUID        REFERENCES turmas(id) ON DELETE SET NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'em_andamento',
    progresso       INTEGER     NOT NULL DEFAULT 0,
    data_matricula  DATE        NOT NULL DEFAULT CURRENT_DATE,
    data_conclusao  DATE,

    CONSTRAINT uq_matriculas_aluno_treinamento
        UNIQUE (aluno_id, treinamento_id),
    CONSTRAINT uq_matriculas_aluno_turma
        UNIQUE (aluno_id, turma_id),
    CONSTRAINT chk_matriculas_status
        CHECK (status IN ('em_andamento', 'aprovado', 'reprovado_falta', 'cancelado')),
    CONSTRAINT chk_matriculas_progresso
        CHECK (progresso BETWEEN 0 AND 100),
    CONSTRAINT chk_matriculas_data_conclusao
        CHECK (data_conclusao IS NULL OR data_conclusao >= data_matricula),
    CONSTRAINT chk_matriculas_conclusao_por_status
        CHECK (
            (status IN ('aprovado', 'reprovado_falta') AND data_conclusao IS NOT NULL)
            OR
            (status IN ('em_andamento', 'cancelado'))
        )
);

CREATE INDEX IF NOT EXISTS idx_matriculas_aluno
    ON matriculas (aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_treinamento
    ON matriculas (treinamento_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma
    ON matriculas (turma_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_status
    ON matriculas (status);

CREATE TABLE IF NOT EXISTS aulas (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id      UUID         NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    numero_aula   INTEGER      NOT NULL,
    titulo        VARCHAR(120) NOT NULL,
    conteudo      TEXT,
    data_aula     DATE         NOT NULL,
    hora_inicio   TIME,
    hora_fim      TIME,
    status        VARCHAR(20)  NOT NULL DEFAULT 'planejada',

    CONSTRAINT uq_aulas_turma_numero
        UNIQUE (turma_id, numero_aula),
    CONSTRAINT uq_aulas_turma_data
        UNIQUE (turma_id, data_aula),
    CONSTRAINT chk_aulas_numero_positivo
        CHECK (numero_aula > 0),
    CONSTRAINT chk_aulas_titulo_nao_vazio
        CHECK (length(trim(titulo)) > 0),
    CONSTRAINT chk_aulas_status
        CHECK (status IN ('planejada', 'realizada', 'cancelada')),
    CONSTRAINT chk_aulas_horario
        CHECK (hora_inicio IS NULL OR hora_fim IS NULL OR hora_fim > hora_inicio)
);

CREATE INDEX IF NOT EXISTS idx_aulas_turma
    ON aulas (turma_id);
CREATE INDEX IF NOT EXISTS idx_aulas_data
    ON aulas (data_aula);
