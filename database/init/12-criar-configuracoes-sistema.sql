-- Configuracoes globais do sistema (MVPs de chave/valor para
-- parametros que podem ser ajustados pelo coordenador sem deploy).
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    chave             TEXT        PRIMARY KEY,
    valor             TEXT        NOT NULL,
    descricao         TEXT,
    atualizado_por_id UUID        REFERENCES usuarios(id) ON DELETE SET NULL,
    atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE configuracoes_sistema IS 'Parametros ajustaveis da aplicacao (periodo letivo, etc.).';
