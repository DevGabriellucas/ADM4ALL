-- =====================================================================
--  ADM4All - Casos extras de demonstracao do MVP
--
--  Este seed complementa o 20-inserir-dados-teste.sql com estados que
--  ajudam a demonstrar badges de frequencia, certificados e materiais
--  ocultos. Pode ser executado varias vezes sem duplicar dados.
-- =====================================================================

INSERT INTO usuarios
    (id, perfil_id, nome, email, cpf, senha, status)
SELECT
    dados.id,
    perfis.id,
    dados.nome,
    dados.email,
    dados.cpf,
    dados.senha,
    dados.status
FROM (
    VALUES
        (
            '0d6e0f57-2a41-48b2-9c92-a0e9e37f0001'::UUID,
            'aluno',
            'Ana Atenção',
            'ana.atencao@example.com',
            '10456789022',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea',
            'ativo'
        ),
        (
            '0d6e0f57-2a41-48b2-9c92-a0e9e37f0002'::UUID,
            'aluno',
            'Bruno Risco',
            'bruno.risco@example.com',
            '20456789030',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea',
            'ativo'
        ),
        (
            '0d6e0f57-2a41-48b2-9c92-a0e9e37f0003'::UUID,
            'aluno',
            'Gabriel Almeida',
            'gabriel.almeida@example.com',
            '30456789049',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea',
            'ativo'
        ),
        (
            '0d6e0f57-2a41-48b2-9c92-a0e9e37f0004'::UUID,
            'aluno',
            'Lara Certificado',
            'lara.certificado@example.com',
            '40567890104',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea',
            'ativo'
        ),
        (
            '0d6e0f57-2a41-48b2-9c92-a0e9e37f0005'::UUID,
            'aluno',
            'Nina Cancelada',
            'nina.cancelada@example.com',
            '50678901260',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea',
            'ativo'
        ),
        (
            '0d6e0f57-2a41-48b2-9c92-a0e9e37f0006'::UUID,
            'aluno',
            'Pedro Sem Matrícula',
            'pedro.sem.matricula@example.com',
            '60789012308',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea',
            'ativo'
        ),
        (
            '0d6e0f57-2a41-48b2-9c92-a0e9e37f0007'::UUID,
            'aluno',
            'Olívia Oculto',
            'olivia.oculto@example.com',
            '70890123446',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea',
            'ativo'
        )
) AS dados(id, perfil_nome, nome, email, cpf, senha, status)
JOIN perfis ON perfis.nome = dados.perfil_nome
ON CONFLICT DO NOTHING;

INSERT INTO alunos
    (id, usuario_id, telefone, data_nascimento, is_aluno_unipe, curso_unipe, treinamento, rgm)
VALUES
    (
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0001',
        '0d6e0f57-2a41-48b2-9c92-a0e9e37f0001',
        '83990000001',
        '2001-01-10',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    ),
    (
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0002',
        '0d6e0f57-2a41-48b2-9c92-a0e9e37f0002',
        '83990000002',
        '2000-02-11',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    ),
    (
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0003',
        '0d6e0f57-2a41-48b2-9c92-a0e9e37f0003',
        '83990000003',
        '1999-03-12',
        FALSE,
        NULL,
        'Assistente Contabil',
        NULL
    ),
    (
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0004',
        '0d6e0f57-2a41-48b2-9c92-a0e9e37f0004',
        '83990000004',
        '1998-04-13',
        FALSE,
        NULL,
        'Assistente Contabil',
        NULL
    ),
    (
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0005',
        '0d6e0f57-2a41-48b2-9c92-a0e9e37f0005',
        '83990000005',
        '2002-05-14',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    ),
    (
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0006',
        '0d6e0f57-2a41-48b2-9c92-a0e9e37f0006',
        '83990000006',
        '2003-06-15',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    ),
    (
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0007',
        '0d6e0f57-2a41-48b2-9c92-a0e9e37f0007',
        '83990000007',
        '2001-07-16',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    )
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO matriculas
    (id, aluno_id, treinamento_id, turma_id, status, progresso, data_matricula, data_conclusao)
VALUES
    (
        '2d6e0f57-2a41-48b2-9c92-a0e9e37f0001',
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0001',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'em_andamento',
        70,
        '2026-03-02',
        NULL
    ),
    (
        '2d6e0f57-2a41-48b2-9c92-a0e9e37f0002',
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0002',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'em_andamento',
        45,
        '2026-03-02',
        NULL
    ),
    (
        '2d6e0f57-2a41-48b2-9c92-a0e9e37f0003',
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0003',
        '3b4169fc-5a08-44aa-b03e-3b2620533378',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        'aprovado',
        100,
        '2026-01-05',
        '2026-03-09'
    ),
    (
        '2d6e0f57-2a41-48b2-9c92-a0e9e37f0004',
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0004',
        '3b4169fc-5a08-44aa-b03e-3b2620533378',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        'aprovado',
        100,
        '2026-01-05',
        '2026-03-09'
    ),
    (
        '2d6e0f57-2a41-48b2-9c92-a0e9e37f0005',
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0005',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'cancelado',
        0,
        '2026-03-02',
        NULL
    ),
    (
        '2d6e0f57-2a41-48b2-9c92-a0e9e37f0007',
        '1d6e0f57-2a41-48b2-9c92-a0e9e37f0007',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'em_andamento',
        10,
        '2026-03-02',
        NULL
    )
ON CONFLICT (aluno_id, treinamento_id) DO NOTHING;

INSERT INTO frequencias (matricula_id, aula_id, data_aula, presente, observacao)
VALUES
    -- Ana Atenção: 75% de frequencia.
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0001', 'caab179f-b787-4ca9-9c29-5282f5f0457c', '2026-02-03', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0001', 'ca514570-b649-4c78-bf8e-b7aacc74a6f4', '2026-02-10', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0001', '2e066384-6434-488f-8f6f-bdd411710bf3', '2026-02-17', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0001', '833962df-4847-4c06-bc3f-c704dc11fdea', '2026-03-02', FALSE, 'Falta para demonstrar badge de atencao'),
    -- Bruno Risco: 50% de frequencia.
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0002', 'caab179f-b787-4ca9-9c29-5282f5f0457c', '2026-02-03', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0002', 'ca514570-b649-4c78-bf8e-b7aacc74a6f4', '2026-02-10', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0002', '2e066384-6434-488f-8f6f-bdd411710bf3', '2026-02-17', FALSE, 'Ausente'),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0002', '833962df-4847-4c06-bc3f-c704dc11fdea', '2026-03-02', FALSE, 'Ausente'),
    -- Gabriel e Lara: aprovados com 100% na turma encerrada de Excel.
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', '16507083-1f0c-4939-9b73-8f3bf4226a45', '2026-01-05', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', 'c04b679c-45e3-493b-bb5f-e1252b32780e', '2026-01-12', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', '852c8a0b-6775-44e5-a7b0-a8009cfa44ba', '2026-01-19', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', '0240ca2b-6628-461b-b8ae-414f05249f01', '2026-01-26', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', '1516575d-0b04-4178-ac36-48a0a8630ab1', '2026-02-02', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', '4050e40e-ba86-4571-82b9-31c9ef690b9e', '2026-02-09', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', '1d658a15-3d6e-46df-bc76-5604ea7d7a7d', '2026-02-16', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', 'db69fdaa-4e33-4909-abbe-490d6e689ac7', '2026-02-23', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', 'bb46c457-ea72-49c4-a1e1-6d871318cce9', '2026-03-02', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0003', '27f0ed23-e7b9-4d51-b3b6-84ea74b19b0c', '2026-03-09', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', '16507083-1f0c-4939-9b73-8f3bf4226a45', '2026-01-05', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', 'c04b679c-45e3-493b-bb5f-e1252b32780e', '2026-01-12', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', '852c8a0b-6775-44e5-a7b0-a8009cfa44ba', '2026-01-19', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', '0240ca2b-6628-461b-b8ae-414f05249f01', '2026-01-26', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', '1516575d-0b04-4178-ac36-48a0a8630ab1', '2026-02-02', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', '4050e40e-ba86-4571-82b9-31c9ef690b9e', '2026-02-09', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', '1d658a15-3d6e-46df-bc76-5604ea7d7a7d', '2026-02-16', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', 'db69fdaa-4e33-4909-abbe-490d6e689ac7', '2026-02-23', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', 'bb46c457-ea72-49c4-a1e1-6d871318cce9', '2026-03-02', TRUE, NULL),
    ('2d6e0f57-2a41-48b2-9c92-a0e9e37f0004', '27f0ed23-e7b9-4d51-b3b6-84ea74b19b0c', '2026-03-09', TRUE, NULL)
ON CONFLICT (matricula_id, data_aula) DO NOTHING;

INSERT INTO certificados
    (id, matricula_id, codigo, status, data_emissao, url_arquivo, emitido_por_id, observacao)
VALUES
    (
        '3d6e0f57-2a41-48b2-9c92-a0e9e37f0004',
        '2d6e0f57-2a41-48b2-9c92-a0e9e37f0004',
        'CERT-DEMO-2026-CANCELADO',
        'cancelado',
        '2026-05-03',
        '/storage/certificados/cert-demo-2026-cancelado.pdf',
        '0befab74-8720-40e2-8a9a-14530f9f7f08',
        'Caso de demonstracao de certificado cancelado'
    )
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO materiais
    (id, turma_id, publicado_por_id, titulo, descricao, tipo, url_arquivo, tamanho_bytes, visibilidade, status)
VALUES
    (
        '4d6e0f57-2a41-48b2-9c92-a0e9e37f0001',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'ddba5066-6c5f-4989-b715-638a0b9a8d58',
        'Material oculto de demonstração',
        'Este item deve aparecer para o instrutor/coordenador, mas não para o aluno.',
        'pdf',
        '/uploads/materiais/material-oculto-demo.pdf',
        774,
        'oculto',
        'ativo'
    )
ON CONFLICT DO NOTHING;
