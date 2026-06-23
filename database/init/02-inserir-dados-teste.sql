-- =====================================================================
--  ADM4All - Seed de desenvolvimento
--
--  Estes dados ajudam a testar login por perfil, dashboard, turmas,
--  cronograma, frequencia, materiais, documentos e certificados.
-- =====================================================================

INSERT INTO perfis (id, nome, descricao, nivel_acesso)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'aluno', 'Acesso do aluno ao proprio curso', 10),
    ('00000000-0000-0000-0000-000000000002', 'instrutor', 'Acesso do instrutor as turmas e presencas', 40),
    ('00000000-0000-0000-0000-000000000003', 'coordenador', 'Acesso de coordenacao aos cursos, turmas e relatorios', 70),
    ('00000000-0000-0000-0000-000000000004', 'admin', 'Acesso administrativo geral e configuracoes', 100)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO alunos
    (id, nome, cpf, telefone, email, data_nascimento, is_aluno_unipe, curso_unipe, senha, treinamento, rgm)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Priscilla Cahino',
        '12345678909',
        '83999990001',
        'priscilla.cahino@example.com',
        '2001-04-12',
        FALSE,
        NULL,
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'Assistente Administrativo',
        NULL
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Diego Martins',
        '98765432100',
        '83988880002',
        'diego.martins@example.com',
        '2000-09-30',
        TRUE,
        'Administracao',
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'Assistente Administrativo',
        '20231001'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Jose Santos',
        '52998224725',
        '83977770003',
        'jose.santos@example.com',
        '1999-02-18',
        FALSE,
        NULL,
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'Assistente Administrativo',
        NULL
    )
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO usuarios
    (id, perfil_id, aluno_id, nome, email, senha, status)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Priscilla Cahino',
        'priscilla.cahino@example.com',
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'ativo'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Diego Martins',
        'diego.martins@example.com',
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'ativo'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Jose Santos',
        'jose.santos@example.com',
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'ativo'
    ),
    (
        '10000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000002',
        NULL,
        'Eduardo Lima',
        'eduardo.lima@example.com',
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'ativo'
    ),
    (
        '10000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000003',
        NULL,
        'Amanda Souza',
        'amanda.souza@example.com',
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'ativo'
    ),
    (
        '10000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0000-000000000004',
        NULL,
        'Administrador TI',
        'admin.ti@example.com',
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8UgzdbzR56jWfGSu2zWTFP1xHda9gW',
        'ativo'
    )
ON CONFLICT DO NOTHING;

INSERT INTO instrutores
    (id, usuario_id, nome, telefone, area_atuacao, formacao)
VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000004',
        'Eduardo Lima',
        '83996660004',
        'Administracao',
        'Gestao Empresarial'
    )
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO coordenadores
    (id, usuario_id, nome, telefone, area_coordenacao)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000005',
        'Amanda Souza',
        '83995550005',
        'Cursos profissionalizantes'
    )
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO treinamentos (id, nome, descricao, carga_horaria)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Assistente Administrativo',
        'Formacao inicial para rotinas administrativas, documentos e atendimento.',
        40
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Excel Basico',
        'Planilhas, formulas simples e organizacao de dados.',
        20
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Power BI',
        'Introducao a paineis, indicadores e visualizacao de dados.',
        30
    )
ON CONFLICT (nome) DO NOTHING;

INSERT INTO turmas
    (id, treinamento_id, instrutor_id, coordenador_id, codigo, nome, turno, local, status, capacidade, data_inicio, data_fim)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
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
        '40000000-0000-0000-0000-000000000002',
        '22222222-2222-2222-2222-222222222222',
        '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'EXCEL-2026-01',
        'Excel Basico 2026.1',
        'online',
        'Ambiente virtual',
        'planejada',
        25,
        '2026-07-15',
        NULL
    )
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO matriculas
    (id, aluno_id, treinamento_id, turma_id, status, progresso, data_matricula, data_conclusao)
VALUES
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        '40000000-0000-0000-0000-000000000001',
        'em_andamento',
        45,
        '2026-03-02',
        NULL
    ),
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        '40000000-0000-0000-0000-000000000001',
        'aprovado',
        100,
        '2026-02-03',
        '2026-04-30'
    ),
    (
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111',
        '40000000-0000-0000-0000-000000000001',
        'reprovado_falta',
        30,
        '2026-02-03',
        '2026-03-20'
    )
ON CONFLICT (aluno_id, treinamento_id) DO NOTHING;

INSERT INTO aulas
    (id, turma_id, numero_aula, titulo, conteudo, data_aula, hora_inicio, hora_fim, status)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        1,
        'Introducao a administracao',
        'Conceitos iniciais e papel do assistente administrativo.',
        '2026-02-03',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        '40000000-0000-0000-0000-000000000001',
        2,
        'Planejamento e organizacao',
        'Rotinas de planejamento, agenda e organizacao documental.',
        '2026-02-10',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        '40000000-0000-0000-0000-000000000001',
        3,
        'Gestao empresarial',
        'Processos administrativos e fluxo de informacoes.',
        '2026-02-17',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '50000000-0000-0000-0000-000000000004',
        '40000000-0000-0000-0000-000000000001',
        4,
        'Rotinas administrativas',
        'Atendimento, controle de documentos e comunicacao.',
        '2026-03-02',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '50000000-0000-0000-0000-000000000005',
        '40000000-0000-0000-0000-000000000001',
        5,
        'Atendimento',
        'Boas praticas de atendimento presencial e digital.',
        '2026-03-09',
        '19:00',
        '21:00',
        'realizada'
    ),
    (
        '50000000-0000-0000-0000-000000000006',
        '40000000-0000-0000-0000-000000000001',
        6,
        'Controle de documentos',
        'Organizacao, recebimento e validacao de documentos.',
        '2026-03-16',
        '19:00',
        '21:00',
        'realizada'
    )
ON CONFLICT (turma_id, numero_aula) DO NOTHING;

INSERT INTO frequencias (matricula_id, aula_id, data_aula, presente, observacao)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '50000000-0000-0000-0000-000000000004', '2026-03-02', TRUE, NULL),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '50000000-0000-0000-0000-000000000005', '2026-03-09', TRUE, NULL),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '50000000-0000-0000-0000-000000000006', '2026-03-16', FALSE, 'Falta justificada em analise'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '50000000-0000-0000-0000-000000000001', '2026-02-03', TRUE, NULL),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '50000000-0000-0000-0000-000000000002', '2026-02-10', TRUE, NULL),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '50000000-0000-0000-0000-000000000003', '2026-02-17', TRUE, NULL),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '50000000-0000-0000-0000-000000000001', '2026-02-03', FALSE, 'Ausente'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '50000000-0000-0000-0000-000000000002', '2026-02-10', FALSE, 'Ausente'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '50000000-0000-0000-0000-000000000003', '2026-02-17', FALSE, 'Ausente')
ON CONFLICT (matricula_id, data_aula) DO NOTHING;

INSERT INTO avaliacoes (id, matricula_id, aula_id, descricao, nota, data_avaliacao)
VALUES
    ('80000000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '50000000-0000-0000-0000-000000000006', 'Avaliacao parcial', 8.50, '2026-03-18'),
    ('80000000-0000-0000-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '50000000-0000-0000-0000-000000000003', 'Avaliacao final', 9.20, '2026-04-25'),
    ('80000000-0000-0000-0000-000000000003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '50000000-0000-0000-0000-000000000003', 'Avaliacao parcial', 6.00, '2026-03-10')
ON CONFLICT DO NOTHING;

INSERT INTO materiais
    (id, turma_id, publicado_por_id, titulo, tipo, url_arquivo, tamanho_bytes, status)
VALUES
    (
        '60000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000004',
        'Introducao a administracao',
        'pdf',
        '/materiais/introducao-administracao.pdf',
        2097152,
        'ativo'
    ),
    (
        '60000000-0000-0000-0000-000000000002',
        '40000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000004',
        'Video - O que e administracao',
        'video',
        '/materiais/video-o-que-e-administracao.mp4',
        5242880,
        'ativo'
    ),
    (
        '60000000-0000-0000-0000-000000000003',
        '40000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000004',
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
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Documento de identificacao',
        'aprovado',
        '2026-03-01',
        '2026-03-02',
        NULL
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Comprovante de residencia',
        'aprovado',
        '2026-03-01',
        '2026-03-02',
        NULL
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Comprovante de matricula Unipe',
        'aprovado',
        '2026-02-01',
        '2026-02-02',
        NULL
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
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
        '70000000-0000-0000-0000-000000000001',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'CERT-ADM-2026-0001',
        'emitido',
        '2026-05-02',
        '/certificados/cert-adm-2026-0001.pdf',
        '10000000-0000-0000-0000-000000000005',
        'Certificado emitido apos conclusao do curso'
    )
ON CONFLICT (codigo) DO NOTHING;
