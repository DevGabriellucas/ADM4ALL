-- =====================================================================
--  ADM4All — Esquema do banco de dados (PostgreSQL)
--  Tabela: alunos
--
--  Este script é executado automaticamente pelo Postgres na PRIMEIRA
--  inicialização do container (pasta /docker-entrypoint-initdb.d).
--  Os nomes das colunas seguem o padrão snake_case do SQL; o back-end
--  mapeia para as propriedades camelCase da entidade Aluno.
--
--  Mapa de colunas (DB)        ->  Propriedade (entidade Aluno.ts)
--    id                        ->  id
--    nome                      ->  nome
--    cpf                       ->  cpf            (somente dígitos)
--    telefone                  ->  telefone       (somente dígitos)
--    email                     ->  email
--    data_nascimento           ->  dataNascimento
--    is_aluno_unipe            ->  isAlunoUnipe
--    curso_unipe               ->  cursoUnipe
--    senha                     ->  senha          (hash bcrypt)
--    treinamento               ->  treinamento
--    rgm                       ->  rgm
--    data_cadastro             ->  dataCadastro
-- =====================================================================

CREATE TABLE IF NOT EXISTS alunos (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome             VARCHAR(255) NOT NULL,
    cpf              VARCHAR(11)  NOT NULL UNIQUE,
    telefone         VARCHAR(11)  NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    data_nascimento  DATE         NOT NULL,
    is_aluno_unipe   BOOLEAN      NOT NULL DEFAULT FALSE,
    curso_unipe      VARCHAR(255),
    senha            VARCHAR(255) NOT NULL,            -- hash bcrypt (~60 chars)
    treinamento      VARCHAR(255) NOT NULL,
    rgm              VARCHAR(8)   UNIQUE,
    data_cadastro    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    -- Validações espelhando as regras do domínio (Aluno.ts / value-objects)
    CONSTRAINT chk_cpf_digitos      CHECK (cpf ~ '^[0-9]{11}$'),
    CONSTRAINT chk_telefone_digitos CHECK (telefone ~ '^[0-9]{10,11}$'),
    CONSTRAINT chk_rgm_digitos      CHECK (rgm IS NULL OR rgm ~ '^[0-9]{8}$'),

    -- Aluno do Unipê precisa informar curso e RGM
    CONSTRAINT chk_unipe_completo   CHECK (
        is_aluno_unipe = FALSE
        OR (curso_unipe IS NOT NULL AND rgm IS NOT NULL)
    )
);

-- Índices para as buscas usadas pelo AlunoRepository
-- (buscarPorCpf, buscarPorEmail, buscarPorEmailOuCpf).
-- cpf, email e rgm já são indexados pelas constraints UNIQUE.
CREATE INDEX IF NOT EXISTS idx_alunos_nome ON alunos (nome);

-- Comentários de documentação (aparecem no Adminer / \d+ no psql)
COMMENT ON TABLE  alunos                  IS 'Alunos cadastrados na plataforma ADM4All';
COMMENT ON COLUMN alunos.cpf              IS 'CPF somente dígitos (11 caracteres)';
COMMENT ON COLUMN alunos.telefone         IS 'Telefone somente dígitos, com DDD (10 ou 11 caracteres)';
COMMENT ON COLUMN alunos.senha            IS 'Hash bcrypt da senha — NUNCA armazenar texto puro';
COMMENT ON COLUMN alunos.is_aluno_unipe   IS 'TRUE quando o aluno é do Unipê (exige curso_unipe e rgm)';
COMMENT ON COLUMN alunos.rgm              IS 'Registro Geral de Matrícula do Unipê (8 dígitos)';
