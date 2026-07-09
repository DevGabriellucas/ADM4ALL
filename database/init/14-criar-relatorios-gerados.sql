CREATE TABLE IF NOT EXISTS relatorios_gerados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    arquivo_csv TEXT,
    arquivo_pdf TEXT,
    filtros_json JSONB,
    gerado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relatorios_gerados_criado_em
    ON relatorios_gerados (criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_relatorios_gerados_tipo
    ON relatorios_gerados (tipo);

COMMENT ON TABLE relatorios_gerados IS 'Relatorios gerados e persistidos pelo coordenador/admin.';
