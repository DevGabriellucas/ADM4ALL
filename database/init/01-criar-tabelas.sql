-- =====================================================================
--  ADM4All - Esquema do banco de dados (PostgreSQL)
--
--  Este script roda automaticamente na primeira inicializacao do container.
--  A tabela alunos foi mantida compativel com o backend atual.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
        CHECK (status IN ('ativo', 'inativo', 'bloqueado'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_lower
    ON usuarios (lower(email));
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil
    ON usuarios (perfil_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_status
    ON usuarios (status);

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

CREATE TABLE IF NOT EXISTS treinamentos (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(120) NOT NULL UNIQUE,
    descricao       TEXT,
    carga_horaria   INTEGER      NOT NULL,
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    data_criacao    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_treinamentos_nome_nao_vazio
        CHECK (length(trim(nome)) > 0),
    CONSTRAINT chk_treinamentos_carga_horaria_positiva
        CHECK (carga_horaria > 0)
);

CREATE TABLE IF NOT EXISTS turmas (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    treinamento_id   UUID         NOT NULL REFERENCES treinamentos(id) ON DELETE RESTRICT,
    instrutor_id     UUID         REFERENCES instrutores(id) ON DELETE SET NULL,
    coordenador_id   UUID         REFERENCES coordenadores(id) ON DELETE SET NULL,
    codigo           VARCHAR(30)  NOT NULL UNIQUE,
    nome             VARCHAR(120) NOT NULL,
    turno            VARCHAR(20)  NOT NULL DEFAULT 'noite',
    local            VARCHAR(120),
    status           VARCHAR(20)  NOT NULL DEFAULT 'planejada',
    capacidade       INTEGER      NOT NULL DEFAULT 30,
    data_inicio      DATE         NOT NULL,
    data_fim         DATE,
    data_criacao     TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_turmas_codigo_nao_vazio
        CHECK (length(trim(codigo)) > 0),
    CONSTRAINT chk_turmas_nome_nao_vazio
        CHECK (length(trim(nome)) > 0),
    CONSTRAINT chk_turmas_turno
        CHECK (turno IN ('manha', 'tarde', 'noite', 'integral', 'online')),
    CONSTRAINT chk_turmas_status
        CHECK (status IN ('planejada', 'em_andamento', 'concluida', 'cancelada')),
    CONSTRAINT chk_turmas_capacidade
        CHECK (capacidade > 0),
    CONSTRAINT chk_turmas_datas
        CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

CREATE INDEX IF NOT EXISTS idx_turmas_treinamento
    ON turmas (treinamento_id);
CREATE INDEX IF NOT EXISTS idx_turmas_instrutor
    ON turmas (instrutor_id);
CREATE INDEX IF NOT EXISTS idx_turmas_coordenador
    ON turmas (coordenador_id);
CREATE INDEX IF NOT EXISTS idx_turmas_status
    ON turmas (status);

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

CREATE TABLE IF NOT EXISTS frequencias (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_id   UUID        NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    aula_id        UUID        REFERENCES aulas(id) ON DELETE CASCADE,
    data_aula      DATE        NOT NULL,
    presente       BOOLEAN     NOT NULL,
    observacao     TEXT,
    data_registro  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_frequencias_matricula_data
        UNIQUE (matricula_id, data_aula)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_frequencias_matricula_aula
    ON frequencias (matricula_id, aula_id)
    WHERE aula_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_frequencias_matricula
    ON frequencias (matricula_id);
CREATE INDEX IF NOT EXISTS idx_frequencias_aula
    ON frequencias (aula_id);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_id   UUID          NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    aula_id        UUID          REFERENCES aulas(id) ON DELETE SET NULL,
    descricao      VARCHAR(120)  NOT NULL,
    nota           NUMERIC(4, 2)  NOT NULL,
    data_avaliacao DATE          NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT chk_avaliacoes_descricao_nao_vazia
        CHECK (length(trim(descricao)) > 0),
    CONSTRAINT chk_avaliacoes_nota_intervalo
        CHECK (nota BETWEEN 0 AND 10)
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_matricula
    ON avaliacoes (matricula_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_aula
    ON avaliacoes (aula_id);

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

CREATE TABLE IF NOT EXISTS documentos_aluno (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id       UUID         NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    tipo           VARCHAR(80)  NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'pendente',
    data_envio     DATE,
    data_validacao DATE,
    observacao     TEXT,

    CONSTRAINT uq_documentos_aluno_tipo
        UNIQUE (aluno_id, tipo),
    CONSTRAINT chk_documentos_tipo_nao_vazio
        CHECK (length(trim(tipo)) > 0),
    CONSTRAINT chk_documentos_status
        CHECK (status IN ('pendente', 'enviado', 'aprovado', 'recusado')),
    CONSTRAINT chk_documentos_datas
        CHECK (data_validacao IS NULL OR data_envio IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_documentos_aluno
    ON documentos_aluno (aluno_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status
    ON documentos_aluno (status);

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

COMMENT ON TABLE perfis IS 'Perfis de acesso da plataforma';
COMMENT ON TABLE usuarios IS 'Usuarios que podem autenticar no sistema';
COMMENT ON TABLE alunos IS 'Alunos cadastrados na plataforma ADM4All';
COMMENT ON TABLE instrutores IS 'Instrutores responsaveis por turmas e aulas';
COMMENT ON TABLE coordenadores IS 'Coordenadores responsaveis por cursos e turmas';
COMMENT ON TABLE treinamentos IS 'Cursos/treinamentos oferecidos pela plataforma';
COMMENT ON TABLE turmas IS 'Turmas abertas para um treinamento';
COMMENT ON TABLE matriculas IS 'Vinculo entre aluno, treinamento e turma, com status e progresso';
COMMENT ON TABLE aulas IS 'Cronograma de aulas por turma';
COMMENT ON TABLE frequencias IS 'Registro de presencas e faltas por matricula/aula';
COMMENT ON TABLE avaliacoes IS 'Notas lancadas por matricula';
COMMENT ON TABLE materiais IS 'Materiais publicados para uma turma';
COMMENT ON TABLE documentos_aluno IS 'Controle de documentos obrigatorios do aluno';
COMMENT ON TABLE certificados IS 'Certificados gerados para matriculas concluidas';
