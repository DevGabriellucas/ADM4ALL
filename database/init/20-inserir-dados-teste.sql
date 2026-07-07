-- =====================================================================
--  ADM4All - Seed de desenvolvimento
--
--  Estes dados ajudam a testar login por perfil, dashboard, turmas,
--  cronograma, frequencia, materiais, documentos e certificados.
--  Os UUIDs v4 sao fixos para manter as chaves estrangeiras reproduziveis.
-- =====================================================================

INSERT INTO perfis (id, nome, descricao, nivel_acesso)
VALUES
    ('f2b625c7-acbe-4b14-9046-c80c4a04eda4', 'aluno', 'Acesso do aluno ao proprio curso', 10),
    ('36e6ad50-2a3f-4500-bd1f-0cd799d4207d', 'instrutor', 'Acesso do instrutor as turmas e presencas', 40),
    ('29b6bec8-1701-463e-95af-c4eaf026ed7f', 'coordenador', 'Acesso de coordenacao aos cursos, turmas e relatorios', 70),
    ('dd3f203e-b35b-4065-af3a-c78af1852159', 'admin', 'Acesso administrativo geral e configuracoes', 100)
ON CONFLICT (nome) DO NOTHING;

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
            'ec9c6235-8532-47e6-bca7-6b58ba85a51f'::UUID,
            'aluno',
            'Priscilla Cahino',
            'priscilla.cahino@example.com',
            '12345678909',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea', -- senha: Aluno@123
            'ativo'
        ),
        (
            '9da009a4-e4d3-4602-a0dc-7c6d7bfafb99'::UUID,
            'aluno',
            'Diego Martins',
            'diego.martins@example.com',
            '98765432100',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea', -- senha: Aluno@123
            'ativo'
        ),
        (
            '10a081dc-89b5-4a59-847a-99095c2110f2'::UUID,
            'aluno',
            'Jose Santos',
            'jose.santos@example.com',
            '52998224725',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea', -- senha: Aluno@123
            'ativo'
        ),
        (
            'ddba5066-6c5f-4989-b715-638a0b9a8d58'::UUID,
            'instrutor',
            'Eduardo Lima',
            'eduardo.lima@example.com',
            '24681357928',
            '$2b$10$/cfTJOtRjPc1axxxvqEIkuEvF0JK.Am.9KGWcuE60ArjBWKgx/mQu', -- senha: Instrutor@123
            'ativo'
        ),
        (
            '0befab74-8720-40e2-8a9a-14530f9f7f08'::UUID,
            'coordenador',
            'Amanda Souza',
            'amanda.souza@example.com',
            '13579246828',
            '$2b$10$hX7nJ9VTWUKkqAmxarLlVeN6ptuUU0qW3utKTyuWyRsPiD3oEHvwO', -- senha: Coordenador@123
            'ativo'
        ),
        (
            'fe768204-7110-45b1-ab1a-94ac9cfde2ef'::UUID,
            'admin',
            'Administrador TI',
            'admin.ti@example.com',
            '86420975310',
            '$2b$10$WsQRiIcbE8o5oyx5IUVSdeoXAWfCBunjvfHpePT1VMq4fazEZRaXm', -- senha: Admin@123
            'ativo'
        ),
        (
            '744b59d4-4d69-4826-9d6c-5b70d7c5a4ce'::UUID,
            'aluno',
            'Joao Ativacao',
            'joao.ativacao@example.com',
            '11144477735',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea', -- senha definida no cadastro publico: Aluno@123
            'pendente_ativacao'
        )


,
        (
            'acbf238d-4461-4749-9fc9-53eb21a6da0f'::UUID,
            'aluno',
            'Maria Convite',
            'maria.convite@example.com',
            '93541134780',
            '$2b$10$ysTGWSiIZogKWgXPlhRzMOcSZuO9a3ajwBcVdoEyp3TVs5oDx8lea', -- senha temporaria, substituida na ativacao
            'pendente_ativacao'
        )


,
        (
            '74c65249-0017-4507-b17b-f080e770926f'::UUID,
            'instrutor',
            'Eduardo Convite',
            'eduardo.convite@example.com',
            '39053344705',
            '$2b$10$/cfTJOtRjPc1axxxvqEIkuEvF0JK.Am.9KGWcuE60ArjBWKgx/mQu', -- senha temporaria, substituida na ativacao
                        'ativo'
        ),
        (
            'c1d2e3f4-a5b6-4789-9cde-f01234567890'::UUID,
            'instrutor',
            'Camila Rocha',
            'camila.rocha@example.com',
            '48296175301',
            '$2b$10$/cfTJOtRjPc1axxxvqEIkuEvF0JK.Am.9KGWcuE60ArjBWKgx/mQu',
            'ativo'
        ),
        (
            'a1b2c3d4-e5f6-4789-8abc-d234567890a1'::UUID,
            'instrutor',
            'Rafael Mendes',
            'rafael.mendes@example.com',
            '75320184690',
            '$2b$10$/cfTJOtRjPc1axxxvqEIkuEvF0JK.Am.9KGWcuE60ArjBWKgx/mQu',
            'ativo'
        ),
        (
            'b1c2d3e4-f5a6-4789-8def-c345678901b2'::UUID,
            'instrutor',
            'Juliana Torres',
            'juliana.torres@example.com',
            '30915846270',
            '$2b$10$/cfTJOtRjPc1axxxvqEIkuEvF0JK.Am.9KGWcuE60ArjBWKgx/mQu',
            'ativo'
        )



) AS dados(id, perfil_nome, nome, email, cpf, senha, status)
JOIN perfis ON perfis.nome = dados.perfil_nome
ON CONFLICT DO NOTHING;

INSERT INTO alunos
    (id, usuario_id, telefone, data_nascimento, is_aluno_unipe, curso_unipe, treinamento, rgm)
VALUES
    (
        'ab34ec25-af9f-4e66-8e3d-48b38178f545',
        'ec9c6235-8532-47e6-bca7-6b58ba85a51f',
        '83999990001',
        '2001-04-12',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    ),
    (
        '61bd79eb-f54b-4992-bcf1-cf5857833356',
        '9da009a4-e4d3-4602-a0dc-7c6d7bfafb99',
        '83988880002',
        '2000-09-30',
        TRUE,
        'Administracao',
        'Assistente Contábil',
        '20231001'
    ),
    (
        'bd306ba1-4eda-4882-9920-d95ac43684b1',
        '10a081dc-89b5-4a59-847a-99095c2110f2',
        '83977770003',
        '1999-02-18',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    ),
    (
        'f765e463-5eaf-4bbf-84ee-c8a78872114a',
        '744b59d4-4d69-4826-9d6c-5b70d7c5a4ce',
        '83994440006',
        '2002-05-16',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    ),
    (
        '3aa75cc6-8a7d-43a9-8b5d-e25cf9b527ae',
        'acbf238d-4461-4749-9fc9-53eb21a6da0f',
        NULL,
        '2001-08-20',
        FALSE,
        NULL,
        'Assistente Administrativo',
        NULL
    )
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO instrutores
    (id, usuario_id, telefone, area_atuacao, formacao)
VALUES
    (
        '9ab264bc-036b-4e62-ba6b-6a93d2da94c2',
        'ddba5066-6c5f-4989-b715-638a0b9a8d58',
        '83996660004',
        'Administracao',
        'Gestao Empresarial'
    ),
    (
        '28a1d4d4-fd35-4dcf-8e2a-536f038ff9b8',
        '74c65249-0017-4507-b17b-f080e770926f',
        NULL,
        NULL,
        NULL
    ),
    (
        'f1e2d3c4-b5a6-4789-8abc-de0123456789',
        'c1d2e3f4-a5b6-4789-9cde-f01234567890',
        '83991110001',
        'Administracao',
        'Gestao de Pessoas'
    ),
    (
        'e1d2c3b4-a5f6-4789-9def-01234567890b',
        'a1b2c3d4-e5f6-4789-8abc-d234567890a1',
        '83992220002',
        'Contabilidade',
        'Ciencias Contabeis'
    ),
    (
        'd1e2f3a4-b5c6-4789-9abc-e234567890c1',
        'b1c2d3e4-f5a6-4789-8def-c345678901b2',
        '83993330003',
        'Marketing',
        'Publicidade e Propaganda'
    )
ON CONFLICT (usuario_id) DO NOTHING;

-- Tokens puros apenas para testes locais das tres variacoes da tela:
-- Aluno publico:
-- fcb88731d54aea7ff9123168b77442bb7f7822f0beb4e71668d33f90d5f7ecef
-- Aluno convidado pelo coordenador:
-- ab29869ddce2d704033b0207aa5ecdd6f39103545d02e1b3e6f36b69842a168c
-- Instrutor convidado pelo coordenador:
-- 98fa8d3db1caa79c5070d6b613d215031d6c1d63746ccf083018bf0b6ae2b554
INSERT INTO ativacoes_conta
    (id, usuario_id, token_hash, tipo, origem, campos_pendentes, expira_em)
VALUES
    (
        '10a91765-d3a1-413c-b06c-b775646455ef',
        '744b59d4-4d69-4826-9d6c-5b70d7c5a4ce',
        encode(digest('fcb88731d54aea7ff9123168b77442bb7f7822f0beb4e71668d33f90d5f7ecef', 'sha256'), 'hex'),
        'ativacao',
        'cadastro_publico',
        '{}',
        now() + interval '3 days'
    ),
    (
        'd2652436-371e-4e3a-a605-ce87bddf4992',
        'acbf238d-4461-4749-9fc9-53eb21a6da0f',
        encode(digest('ab29869ddce2d704033b0207aa5ecdd6f39103545d02e1b3e6f36b69842a168c', 'sha256'), 'hex'),
        'ativacao',
        'criado_por_coordenador',
        ARRAY['senha', 'whatsapp', 'rgm', 'cursoUnipe'],
        now() + interval '3 days'
    ),
    (
        'f27fa95a-18d2-452e-861a-700a74be27cc',
        '74c65249-0017-4507-b17b-f080e770926f',
        encode(digest('98fa8d3db1caa79c5070d6b613d215031d6c1d63746ccf083018bf0b6ae2b554', 'sha256'), 'hex'),
        'ativacao',
        'criado_por_coordenador',
        ARRAY['senha', 'whatsapp', 'areaAtuacao', 'formacao'],
        now() + interval '3 days'
    )
ON CONFLICT (token_hash) DO NOTHING;

INSERT INTO coordenadores
    (id, usuario_id, telefone, area_coordenacao)
VALUES
    (
        '99fa3cbc-5367-4911-a6d2-dba72e50d6c0',
        '0befab74-8720-40e2-8a9a-14530f9f7f08',
        '83995550005',
        'Cursos profissionalizantes'
    )
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO treinamentos (id, nome, descricao, carga_horaria)
VALUES
    (
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'Assistente Administrativo',
        'Formacao inicial para rotinas administrativas, documentos e atendimento.',
        40
    ),
    (
        '3b4169fc-5a08-44aa-b03e-3b2620533378',
        'Assistente Contábil',
        'Rotinas contábeis, documentos fiscais e apoio ao setor financeiro.',
        20
    ),
    (
        '2f9a746b-70dc-4261-b150-2ec16d2b842c',
        'Assistente de RH',
        'Rotinas de recursos humanos, admissão, documentos e atendimento.',
        30
    ),
    (
        '13f6bf4a-8d9d-4e54-a5f1-5a5c4b79f111',
        'Assistente de Marketing',
        'Fundamentos de marketing, atendimento, comunicacao e apoio comercial.',
        30
    ),
    (
        '0af7df27-d7cf-4d86-b1a9-4b9f4fe6c222',
        'Empreendedorismo',
        'Planejamento, validacao de ideias e gestao inicial de pequenos negocios.',
        30
    )
ON CONFLICT (nome) DO NOTHING;

INSERT INTO turmas
    (id, treinamento_id, coordenador_id, codigo, nome, turno, local, status, capacidade, data_inicio, data_fim)
VALUES
    (
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        '99fa3cbc-5367-4911-a6d2-dba72e50d6c0',
        'ADM-2026-01',
        'Assistente Administrativo 2026.1',
        'noite',
        'Sala 01',
        'em_andamento',
        30,
        '2026-02-03',
        '2026-06-30'
    ),
    (
        '39e19e8c-5207-44d4-a8aa-0f566410b75d',
        '3b4169fc-5a08-44aa-b03e-3b2620533378',
        '99fa3cbc-5367-4911-a6d2-dba72e50d6c0',
        'CONT-2026-01',
        'Assistente Contábil 2026.1',
        'noite',
        'Sala 02',
        'em_andamento',
        30,
        '2026-02-03',
        '2026-06-30'
    ),
    (
        '25052a8f-00a2-47f7-82af-f46cf4f70991',
        '2f9a746b-70dc-4261-b150-2ec16d2b842c',
        '99fa3cbc-5367-4911-a6d2-dba72e50d6c0',
        'RH-2026-01',
        'Assistente de RH 2026.1',
        'manha',
        'Sala 03',
        'em_andamento',
        30,
        '2026-02-03',
        '2026-06-30'
    ),
    (
        'c00cffc0-8d1a-4f69-9c2a-654bbeb4ced1',
        '13f6bf4a-8d9d-4e54-a5f1-5a5c4b79f111',
        '99fa3cbc-5367-4911-a6d2-dba72e50d6c0',
        'MKT-2026-01',
        'Assistente de Marketing 2026.1',
        'tarde',
        'Sala 04',
        'em_andamento',
        30,
        '2026-02-03',
        '2026-06-30'
    ),
    (
        'b77aeb2c-ae47-4a60-93c9-68c47c0c6a3a',
        '0af7df27-d7cf-4d86-b1a9-4b9f4fe6c222',
        '99fa3cbc-5367-4911-a6d2-dba72e50d6c0',
        'EMP-2026-01',
        'Empreendedorismo 2026.1',
        'online',
        'Ambiente virtual',
        'em_andamento',
        30,
        '2026-02-03',
        '2026-06-30'
    ),
    (
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        '3b4169fc-5a08-44aa-b03e-3b2620533378',
        '99fa3cbc-5367-4911-a6d2-dba72e50d6c0',
        'CONTABIL-2026-01',
        'Assistente Contábil 2026.1',
        'online',
        'Ambiente virtual',
        'concluida',
        25,
        '2026-01-05',
        '2026-03-09'
    )
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO turma_instrutores (turma_id, instrutor_id)
SELECT
    dados.turma_id::UUID,
    dados.instrutor_id::UUID
FROM (
    VALUES
        ('df349e38-0e92-4971-b67b-2deb56b90c7b', '9ab264bc-036b-4e62-ba6b-6a93d2da94c2'),
        ('df349e38-0e92-4971-b67b-2deb56b90c7b', '28a1d4d4-fd35-4dcf-8e2a-536f038ff9b8'),
        ('df349e38-0e92-4971-b67b-2deb56b90c7b', 'f1e2d3c4-b5a6-4789-8abc-de0123456789'),
        ('39e19e8c-5207-44d4-a8aa-0f566410b75d', '9ab264bc-036b-4e62-ba6b-6a93d2da94c2'),
        ('39e19e8c-5207-44d4-a8aa-0f566410b75d', 'e1d2c3b4-a5f6-4789-9def-01234567890b'),
        ('25052a8f-00a2-47f7-82af-f46cf4f70991', '9ab264bc-036b-4e62-ba6b-6a93d2da94c2'),
        ('25052a8f-00a2-47f7-82af-f46cf4f70991', 'd1e2f3a4-b5c6-4789-9abc-e234567890c1'),
        ('c00cffc0-8d1a-4f69-9c2a-654bbeb4ced1', '9ab264bc-036b-4e62-ba6b-6a93d2da94c2'),
        ('b77aeb2c-ae47-4a60-93c9-68c47c0c6a3a', '9ab264bc-036b-4e62-ba6b-6a93d2da94c2'),
        ('8856e6f0-efad-47f3-88f5-ec58e8e9bbfc', '9ab264bc-036b-4e62-ba6b-6a93d2da94c2')
) AS dados(turma_id, instrutor_id)
ON CONFLICT (turma_id, instrutor_id) DO NOTHING;

INSERT INTO matriculas
    (id, aluno_id, treinamento_id, turma_id, status, progresso, data_matricula, data_conclusao)
VALUES
    -- Priscilla: dashboard em andamento, com uma falta e aulas pendentes.
    (
        '8d59600f-f3bf-4688-876b-01d30b22dcea',
        'ab34ec25-af9f-4e66-8e3d-48b38178f545',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'em_andamento',
        60,
        '2026-03-02',
        NULL
    ),
    (
        '20b0624a-0d58-46db-bf19-ce4f548c1a6f',
        '61bd79eb-f54b-4992-bcf1-cf5857833356',
        '3b4169fc-5a08-44aa-b03e-3b2620533378',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        'aprovado',
        100,
        '2026-01-05',
        '2026-03-09'
    ),
    (
        'e7349796-aeb0-48c3-8516-72fb5d3d56c8',
        'bd306ba1-4eda-4882-9920-d95ac43684b1',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'reprovado_falta',
        30,
        '2026-02-03',
        '2026-03-20'
    ),
    (
        '8ec26641-b923-4475-9675-d12480b3b438',
        'f765e463-5eaf-4bbf-84ee-c8a78872114a',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'em_andamento',
        0,
        '2026-03-02',
        NULL
    ),
    (
        '9826e53a-847c-409c-b457-c189ed5cf4f6',
        '3aa75cc6-8a7d-43a9-8b5d-e25cf9b527ae',
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'em_andamento',
        0,
        '2026-03-02',
        NULL
    )
ON CONFLICT (aluno_id, treinamento_id) DO NOTHING;

INSERT INTO aulas
    (id, turma_id, numero_aula, titulo, conteudo, data_aula, hora_inicio, hora_fim, status)
VALUES
    (
        'caab179f-b787-4ca9-9c29-5282f5f0457c',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        1,
        'Introducao a administracao',
        'Conceitos iniciais e papel do assistente administrativo.',
        '2026-02-03',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        'ca514570-b649-4c78-bf8e-b7aacc74a6f4',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        2,
        'Planejamento e organizacao',
        'Rotinas de planejamento, agenda e organizacao documental.',
        '2026-02-10',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '2e066384-6434-488f-8f6f-bdd411710bf3',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        3,
        'Gestao empresarial',
        'Processos administrativos e fluxo de informacoes.',
        '2026-02-17',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '833962df-4847-4c06-bc3f-c704dc11fdea',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        4,
        'Rotinas administrativas',
        'Atendimento, controle de documentos e comunicacao.',
        '2026-03-02',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '71527536-9f94-491c-8dff-12a5f49e68bf',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        5,
        'Atendimento',
        'Boas praticas de atendimento presencial e digital.',
        '2026-03-09',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        'a16fdd4b-86e9-4f1a-b741-3f3d48189592',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        6,
        'Controle de documentos',
        'Organizacao, recebimento e validacao de documentos.',
        '2026-03-16',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        'b799294c-ac81-4db5-8846-6d2eb464526c',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        7,
        'Etica profissional',
        'Conduta profissional, postura no atendimento e sigilo de informacoes.',
        '2026-06-24',
        '19:00',
        '21:00',
        'planejada'
    ),
    (
        '7151df23-1bf5-4226-95d9-3f83b0a94d3c',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        8,
        'Nocoes financeiras',
        'Controle simples de entradas, saidas, recibos e organizacao financeira.',
        '2026-06-26',
        '19:00',
        '21:00',
        'planejada'
    ),
    (
        'b7f358d8-cf1e-46e8-943c-3f4069a32449',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        9,
        'Tecnologia no ambiente administrativo',
        'Ferramentas digitais para produtividade e organizacao do trabalho.',
        '2026-06-29',
        '19:00',
        '21:00',
        'planejada'
    ),
    (
        'ac2fbc63-4bbb-4f71-9a33-7c46d8d1cb8c',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        10,
        'Revisao e encerramento',
        'Revisao geral dos conteudos e orientacoes finais.',
        '2026-06-30',
        '19:00',
        '21:00',
        'planejada'
    ),
    -- Diego: dashboard aprovado, turma concluida e certificado emitido.
    (
        '16507083-1f0c-4939-9b73-8f3bf4226a45',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        1,
        'Introducao ao Excel',
        'Interface, pastas de trabalho e navegacao em planilhas.',
        '2026-01-05',
        '19:00',
        '21:00',
        'realizada'
    ),
    -- Jose: dashboard reprovado por falta, sem certificado.
    (
        'c04b679c-45e3-493b-bb5f-e1252b32780e',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        2,
        'Formatacao de planilhas',
        'Formatacao de celulas, tabelas e dados.',
        '2026-01-12',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '852c8a0b-6775-44e5-a7b0-a8009cfa44ba',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        3,
        'Formulas basicas',
        'Operadores e referencias de celulas.',
        '2026-01-19',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '0240ca2b-6628-461b-b8ae-414f05249f01',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        4,
        'Funcoes essenciais',
        'Soma, media, minimo e maximo.',
        '2026-01-26',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '1516575d-0b04-4178-ac36-48a0a8630ab1',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        5,
        'Classificacao e filtros',
        'Organizacao e consulta de conjuntos de dados.',
        '2026-02-02',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '4050e40e-ba86-4571-82b9-31c9ef690b9e',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        6,
        'Graficos',
        'Criacao e personalizacao de graficos.',
        '2026-02-09',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '1d658a15-3d6e-46df-bc76-5604ea7d7a7d',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        7,
        'Validacao de dados',
        'Listas, regras e mensagens de validacao.',
        '2026-02-16',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        'db69fdaa-4e33-4909-abbe-490d6e689ac7',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        8,
        'Funcoes condicionais',
        'Uso das funcoes SE e CONT.SE.',
        '2026-02-23',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        'bb46c457-ea72-49c4-a1e1-6d871318cce9',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        9,
        'Impressao e compartilhamento',
        'Configuracao de pagina e exportacao.',
        '2026-03-02',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '27f0ed23-e7b9-4d51-b3b6-84ea74b19b0c',
        '8856e6f0-efad-47f3-88f5-ec58e8e9bbfc',
        10,
        'Projeto final',
        'Consolidacao dos conteudos em uma planilha completa.',
        '2026-03-09',
        '19:00',
        '21:00',
        'realizada'
    )
ON CONFLICT (turma_id, numero_aula) DO NOTHING;

INSERT INTO frequencias (matricula_id, aula_id, data_aula, presente, observacao)
VALUES
    ('8d59600f-f3bf-4688-876b-01d30b22dcea', '833962df-4847-4c06-bc3f-c704dc11fdea', '2026-03-02', TRUE, NULL),
    ('8d59600f-f3bf-4688-876b-01d30b22dcea', '71527536-9f94-491c-8dff-12a5f49e68bf', '2026-03-09', TRUE, NULL),
    ('8d59600f-f3bf-4688-876b-01d30b22dcea', 'a16fdd4b-86e9-4f1a-b741-3f3d48189592', '2026-03-16', FALSE, 'Falta justificada em analise'),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', '16507083-1f0c-4939-9b73-8f3bf4226a45', '2026-01-05', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', 'c04b679c-45e3-493b-bb5f-e1252b32780e', '2026-01-12', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', '852c8a0b-6775-44e5-a7b0-a8009cfa44ba', '2026-01-19', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', '0240ca2b-6628-461b-b8ae-414f05249f01', '2026-01-26', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', '1516575d-0b04-4178-ac36-48a0a8630ab1', '2026-02-02', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', '4050e40e-ba86-4571-82b9-31c9ef690b9e', '2026-02-09', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', '1d658a15-3d6e-46df-bc76-5604ea7d7a7d', '2026-02-16', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', 'db69fdaa-4e33-4909-abbe-490d6e689ac7', '2026-02-23', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', 'bb46c457-ea72-49c4-a1e1-6d871318cce9', '2026-03-02', TRUE, NULL),
    ('20b0624a-0d58-46db-bf19-ce4f548c1a6f', '27f0ed23-e7b9-4d51-b3b6-84ea74b19b0c', '2026-03-09', TRUE, NULL),
    ('e7349796-aeb0-48c3-8516-72fb5d3d56c8', 'caab179f-b787-4ca9-9c29-5282f5f0457c', '2026-02-03', FALSE, 'Ausente'),
    ('e7349796-aeb0-48c3-8516-72fb5d3d56c8', 'ca514570-b649-4c78-bf8e-b7aacc74a6f4', '2026-02-10', FALSE, 'Ausente'),
    ('e7349796-aeb0-48c3-8516-72fb5d3d56c8', '2e066384-6434-488f-8f6f-bdd411710bf3', '2026-02-17', FALSE, 'Ausente')
ON CONFLICT (matricula_id, data_aula) DO NOTHING;

INSERT INTO avaliacoes (id, matricula_id, aula_id, descricao, nota, data_avaliacao)
VALUES
    ('49605b6a-f82f-49dc-a7b6-1d0b11b0c9b1', '8d59600f-f3bf-4688-876b-01d30b22dcea', 'a16fdd4b-86e9-4f1a-b741-3f3d48189592', 'Avaliacao parcial', 8.50, '2026-03-18'),
    ('a0bc6ca1-a669-42c9-88f4-91167d1a09bb', '20b0624a-0d58-46db-bf19-ce4f548c1a6f', '27f0ed23-e7b9-4d51-b3b6-84ea74b19b0c', 'Avaliacao final', 9.20, '2026-03-09'),
    ('17d10dc1-977f-44ca-b5fd-436cd6ef5c82', 'e7349796-aeb0-48c3-8516-72fb5d3d56c8', '2e066384-6434-488f-8f6f-bdd411710bf3', 'Avaliacao parcial', 6.00, '2026-03-10')
ON CONFLICT DO NOTHING;

INSERT INTO materiais
    (id, turma_id, publicado_por_id, titulo, tipo, url_arquivo, tamanho_bytes, status)
VALUES
    (
        'fa2d5097-5f45-404c-b201-b0635f436c12',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'ddba5066-6c5f-4989-b715-638a0b9a8d58',
        'Introducao a administracao',
        'pdf',
        '/materiais/introducao-administracao.pdf',
        2097152,
        'ativo'
    ),
    (
        'abf3710c-895e-446e-880d-7f8eb231747d',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'ddba5066-6c5f-4989-b715-638a0b9a8d58',
        'Video - O que e administracao',
        'video',
        '/materiais/video-o-que-e-administracao.mp4',
        5242880,
        'ativo'
    ),
    (
        'bdfd0211-81d8-4cd1-9e88-2075bff1465a',
        'df349e38-0e92-4971-b67b-2deb56b90c7b',
        'ddba5066-6c5f-4989-b715-638a0b9a8d58',
        'Atividade de fixacao',
        'documento',
        '/materiais/atividade-fixacao.docx',
        1572864,
        'ativo'
    )
ON CONFLICT DO NOTHING;

INSERT INTO documentos_aluno
    (aluno_id, tipo, status, data_envio, data_validacao, observacao)
VALUES
    (
        'ab34ec25-af9f-4e66-8e3d-48b38178f545',
        'Documento de identificacao',
        'aprovado',
        '2026-03-01',
        '2026-03-02',
        NULL
    ),
    (
        'ab34ec25-af9f-4e66-8e3d-48b38178f545',
        'Comprovante de residencia',
        'aprovado',
        '2026-03-01',
        '2026-03-02',
        NULL
    ),
    (
        '61bd79eb-f54b-4992-bcf1-cf5857833356',
        'Comprovante de matricula Unipe',
        'aprovado',
        '2026-02-01',
        '2026-02-02',
        NULL
    ),
    (
        'bd306ba1-4eda-4882-9920-d95ac43684b1',
        'Comprovante de residencia',
        'pendente',
        NULL,
        NULL,
        'Aluno ainda nao enviou o documento'
    )
ON CONFLICT (aluno_id, tipo) DO NOTHING;

INSERT INTO certificados
    (id, matricula_id, codigo, status, data_emissao, url_arquivo, emitido_por_id, observacao)
VALUES
    (
        '1451f3ea-8766-423b-a3ab-758baa8299ac',
        '20b0624a-0d58-46db-bf19-ce4f548c1a6f',
        'CERT-ADM-2026-0001',
        'emitido',
        '2026-05-02',
        '/certificados/cert-adm-2026-0001.pdf',
        '0befab74-8720-40e2-8a9a-14530f9f7f08',
        'Certificado emitido apos conclusao do curso'
    )
ON CONFLICT (codigo) DO NOTHING;
