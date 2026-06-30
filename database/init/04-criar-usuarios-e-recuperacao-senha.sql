-- Usuarios do sistema e controle de recuperacao de senha.

CREATE TABLE IF NOT EXISTS usuarios (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id     UUID         NOT NULL REFERENCES perfis(id) ON DELETE RESTRICT,
    aluno_id      UUID         UNIQUE REFERENCES alunos(id) ON DELETE SET NULL,
    nome          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    senha         VARCHAR(255) NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ativo',
    data_criacao  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    ultimo_login  TIMESTAMPTZ,

    CONSTRAINT chk_usuarios_nome_nao_vazio
        CHECK (length(trim(nome)) > 0),
    CONSTRAINT chk_usuarios_email_formato
        CHECK (email = lower(trim(email)) AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
    CONSTRAINT chk_usuarios_status
        CHECK (status IN ('ativo', 'inativo', 'bloqueado', 'pendente_ativacao'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_lower
    ON usuarios (lower(email));
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil
    ON usuarios (perfil_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_status
    ON usuarios (status);

CREATE TABLE IF NOT EXISTS recuperacoes_senha (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    solicitado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expira_em       TIMESTAMPTZ  NOT NULL DEFAULT (now() + interval '15 minutes'),
    usado_em        TIMESTAMPTZ,
    ip_solicitante  VARCHAR(45),
    user_agent      TEXT,

    CONSTRAINT chk_recuperacoes_token_hash_nao_vazio
        CHECK (length(trim(token_hash)) > 0),
    CONSTRAINT chk_recuperacoes_expiracao
        CHECK (expira_em > solicitado_em),
    CONSTRAINT chk_recuperacoes_usado
        CHECK (usado_em IS NULL OR usado_em >= solicitado_em)
);

CREATE INDEX IF NOT EXISTS idx_recuperacoes_senha_usuario
    ON recuperacoes_senha (usuario_id);
CREATE INDEX IF NOT EXISTS idx_recuperacoes_senha_usuario_solicitado
    ON recuperacoes_senha (usuario_id, solicitado_em DESC);
CREATE INDEX IF NOT EXISTS idx_recuperacoes_senha_expira_em
    ON recuperacoes_senha (expira_em);
CREATE INDEX IF NOT EXISTS idx_recuperacoes_senha_pendentes
    ON recuperacoes_senha (usuario_id, expira_em)
    WHERE usado_em IS NULL;
