-- Materiais didaticos e certificados.

CREATE TABLE IF NOT EXISTS materiais (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id          UUID         NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    publicado_por_id  UUID         REFERENCES usuarios(id) ON DELETE SET NULL,
    titulo            VARCHAR(120) NOT NULL,
    tipo              VARCHAR(30)  NOT NULL,
    url_arquivo       TEXT,
    tamanho_bytes     INTEGER,
    status            VARCHAR(20)  NOT NULL DEFAULT 'ativo',
    data_publicacao   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_materiais_titulo_nao_vazio
        CHECK (length(trim(titulo)) > 0),
    CONSTRAINT chk_materiais_tipo
        CHECK (tipo IN ('pdf', 'video', 'imagem', 'documento', 'link', 'outro')),
    CONSTRAINT chk_materiais_tamanho
        CHECK (tamanho_bytes IS NULL OR tamanho_bytes > 0),
    CONSTRAINT chk_materiais_status
        CHECK (status IN ('ativo', 'arquivado'))
);

CREATE INDEX IF NOT EXISTS idx_materiais_turma
    ON materiais (turma_id);
CREATE INDEX IF NOT EXISTS idx_materiais_publicado_por
    ON materiais (publicado_por_id);

CREATE TABLE IF NOT EXISTS certificados (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_id    UUID        NOT NULL UNIQUE REFERENCES matriculas(id) ON DELETE CASCADE,
    codigo          VARCHAR(40) NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'pendente',
    data_emissao    DATE,
    url_arquivo     TEXT,
    emitido_por_id  UUID        REFERENCES usuarios(id) ON DELETE SET NULL,
    observacao      TEXT,

    CONSTRAINT chk_certificados_codigo_nao_vazio
        CHECK (length(trim(codigo)) > 0),
    CONSTRAINT chk_certificados_status
        CHECK (status IN ('pendente', 'emitido', 'cancelado')),
    CONSTRAINT chk_certificados_data_emissao
        CHECK (status <> 'emitido' OR data_emissao IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_certificados_status
    ON certificados (status);
CREATE INDEX IF NOT EXISTS idx_certificados_emitido_por
    ON certificados (emitido_por_id);
