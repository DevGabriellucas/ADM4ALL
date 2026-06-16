-- =====================================================================
--  ADM4All — Seed de exemplo (apenas para desenvolvimento)
--
--  Roda automaticamente após o 01-schema.sql na primeira inicialização.
--  IMPORTANTE: o campo `senha` abaixo é um HASH bcrypt de exemplo
--  (placeholder). Ele NÃO serve para login real — alunos de verdade
--  devem ser criados pelo cadastro do back-end, que gera o hash correto.
--  Remova/edite este arquivo se não quiser dados de exemplo.
-- =====================================================================

INSERT INTO alunos
    (nome, cpf, telefone, email, data_nascimento, is_aluno_unipe, curso_unipe, senha, treinamento, rgm)
VALUES
    -- Aluno externo (não-Unipê): sem curso e sem rgm
    (
        'Maria Souza',
        '12345678909',
        '83999990001',
        'maria.souza@example.com',
        '2001-04-12',
        FALSE,
        NULL,
        '$2b$10$exemploHashBcryptDePlaceholderNaoUsarParaLogin000000',
        'Excel Básico',
        NULL
    ),
    -- Aluno do Unipê: com curso e rgm (8 dígitos)
    (
        'João Pereira',
        '98765432100',
        '8398888002',
        'joao.pereira@example.com',
        '2000-09-30',
        TRUE,
        'Administração',
        '$2b$10$exemploHashBcryptDePlaceholderNaoUsarParaLogin000000',
        'Power BI',
        '20231001'
    )
ON CONFLICT (cpf) DO NOTHING;
