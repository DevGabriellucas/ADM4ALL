-- Cursos/treinamentos e turmas oferecidas.

CREATE TABLE IF NOT EXISTS treinamentos (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(120) NOT NULL UNIQUE,
    descricao       TEXT,
    carga_horaria   INTEGER      NOT NULL,
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'em_planejamento',
    data_criacao    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_treinamentos_nome_nao_vazio
        CHECK (length(trim(nome)) > 0),
    CONSTRAINT chk_treinamentos_carga_horaria_positiva
        CHECK (carga_horaria > 0),
    CONSTRAINT chk_treinamentos_status
        CHECK (status IN ('ativo', 'em_planejamento', 'desativado'))
);

CREATE TABLE IF NOT EXISTS turmas (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    treinamento_id   UUID         NOT NULL REFERENCES treinamentos(id) ON DELETE RESTRICT,
    coordenador_id   UUID         REFERENCES coordenadores(id) ON DELETE SET NULL,
    codigo           VARCHAR(30)  NOT NULL UNIQUE,
    nome             VARCHAR(120) NOT NULL,
    turno            VARCHAR(20)  NOT NULL DEFAULT 'noite',
    local            VARCHAR(120),
    horario          VARCHAR(120),
    periodo_letivo   VARCHAR(6)   NOT NULL DEFAULT '2026.1',
    status           VARCHAR(20)  NOT NULL DEFAULT 'planejada',
    capacidade       INTEGER      NOT NULL DEFAULT 30,
    data_inicio      DATE         NOT NULL,
    data_fim         DATE         NOT NULL,
    data_criacao     TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_turmas_codigo_nao_vazio
        CHECK (length(trim(codigo)) > 0),
    CONSTRAINT chk_turmas_nome_nao_vazio
        CHECK (length(trim(nome)) > 0),
    CONSTRAINT chk_turmas_turno
        CHECK (turno IN ('manha', 'tarde', 'noite', 'integral', 'online')),
    CONSTRAINT chk_turmas_periodo_letivo
        CHECK (periodo_letivo ~ '^[0-9]{4}\.[12]$'),
    CONSTRAINT chk_turmas_status
        CHECK (status IN ('planejada', 'em_andamento', 'concluida', 'encerrada', 'cancelada')),
    CONSTRAINT chk_turmas_capacidade
        CHECK (capacidade > 0),
    CONSTRAINT chk_turmas_datas
        CHECK (data_fim >= data_inicio)
);

CREATE INDEX IF NOT EXISTS idx_turmas_treinamento
    ON turmas (treinamento_id);
CREATE INDEX IF NOT EXISTS idx_turmas_coordenador
    ON turmas (coordenador_id);
CREATE INDEX IF NOT EXISTS idx_turmas_status
    ON turmas (status);

-- ============================================================
-- Vinculo muitos-para-muitos entre turmas e instrutores.
-- Unica fonte de verdade para o relacionamento.
-- ============================================================
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
