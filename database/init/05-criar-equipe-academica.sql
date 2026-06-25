-- Pessoas da equipe academica: instrutores e coordenadores.

CREATE TABLE IF NOT EXISTS instrutores (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id     UUID         NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nome           VARCHAR(255) NOT NULL,
    telefone       VARCHAR(11),
    area_atuacao   VARCHAR(120),
    formacao       VARCHAR(120),
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
    data_cadastro  TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_instrutores_nome_nao_vazio
        CHECK (length(trim(nome)) > 0),
    CONSTRAINT chk_instrutores_telefone
        CHECK (telefone IS NULL OR telefone ~ '^[0-9]{10,11}$'),
    CONSTRAINT chk_instrutores_area_nao_vazia
        CHECK (area_atuacao IS NULL OR length(trim(area_atuacao)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_instrutores_ativo
    ON instrutores (ativo);

CREATE TABLE IF NOT EXISTS coordenadores (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id        UUID         NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nome              VARCHAR(255) NOT NULL,
    telefone          VARCHAR(11),
    area_coordenacao  VARCHAR(120),
    ativo             BOOLEAN      NOT NULL DEFAULT TRUE,
    data_cadastro     TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_coordenadores_nome_nao_vazio
        CHECK (length(trim(nome)) > 0),
    CONSTRAINT chk_coordenadores_telefone
        CHECK (telefone IS NULL OR telefone ~ '^[0-9]{10,11}$'),
    CONSTRAINT chk_coordenadores_area_nao_vazia
        CHECK (area_coordenacao IS NULL OR length(trim(area_coordenacao)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_coordenadores_ativo
    ON coordenadores (ativo);
