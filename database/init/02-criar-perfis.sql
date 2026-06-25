-- Perfis de acesso do sistema.

CREATE TABLE IF NOT EXISTS perfis (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          VARCHAR(30) NOT NULL UNIQUE,
    descricao     TEXT,
    nivel_acesso  SMALLINT    NOT NULL,
    ativo         BOOLEAN     NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_perfis_nome
        CHECK (nome IN ('aluno', 'instrutor', 'coordenador', 'admin')),
    CONSTRAINT chk_perfis_nivel_acesso
        CHECK (nivel_acesso BETWEEN 1 AND 100)
);
