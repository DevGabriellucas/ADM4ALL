-- Cadastro base de alunos.
-- Mantido compativel com o backend atual.

CREATE TABLE IF NOT EXISTS alunos (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome             VARCHAR(255) NOT NULL,
    cpf              VARCHAR(11)  NOT NULL UNIQUE,
    telefone         VARCHAR(11)  NOT NULL,
    email            VARCHAR(255) NOT NULL,
    data_nascimento  DATE         NOT NULL,
    is_aluno_unipe   BOOLEAN      NOT NULL DEFAULT FALSE,
    curso_unipe      VARCHAR(255),
    senha            VARCHAR(255) NOT NULL,
    treinamento      VARCHAR(255) NOT NULL,
    rgm              VARCHAR(8)   UNIQUE,
    data_cadastro    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_alunos_nome_nao_vazio
        CHECK (length(trim(nome)) > 0),
    CONSTRAINT chk_alunos_cpf_digitos
        CHECK (cpf ~ '^[0-9]{11}$'),
    CONSTRAINT chk_alunos_cpf_nao_repetido
        CHECK (cpf !~ '^([0-9])\1{10}$'),
    CONSTRAINT chk_alunos_telefone_digitos
        CHECK (telefone ~ '^[0-9]{10,11}$'),
    CONSTRAINT chk_alunos_email_formato
        CHECK (email = lower(trim(email)) AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
    CONSTRAINT chk_alunos_data_nascimento_passado
        CHECK (data_nascimento < CURRENT_DATE),
    CONSTRAINT chk_alunos_curso_unipe_nao_vazio
        CHECK (curso_unipe IS NULL OR length(trim(curso_unipe)) > 0),
    CONSTRAINT chk_alunos_treinamento_nao_vazio
        CHECK (length(trim(treinamento)) > 0),
    CONSTRAINT chk_alunos_rgm_digitos
        CHECK (rgm IS NULL OR rgm ~ '^[0-9]{8}$'),
    CONSTRAINT chk_alunos_unipe_completo
        CHECK (
            (is_aluno_unipe = FALSE AND curso_unipe IS NULL AND rgm IS NULL)
            OR
            (is_aluno_unipe = TRUE AND curso_unipe IS NOT NULL AND rgm IS NOT NULL)
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_alunos_email_lower
    ON alunos (lower(email));
CREATE INDEX IF NOT EXISTS idx_alunos_nome
    ON alunos (nome);
CREATE INDEX IF NOT EXISTS idx_alunos_data_cadastro
    ON alunos (data_cadastro);
