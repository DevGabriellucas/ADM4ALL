-- Cursos oferecidos pelo projeto.
--
-- Ficam no init porque o cadastro publico depende deles: o formulario exige
-- escolher um treinamento, e sem nenhum cadastrado a lista aparece vazia e o
-- aluno nao consegue concluir a inscricao.
--
-- A coordenacao pode editar, desativar ou acrescentar cursos pela interface.
-- O ON CONFLICT (nome) evita duplicar caso o script rode de novo.

INSERT INTO treinamentos (id, nome, descricao, carga_horaria, status)
VALUES
    (
        '524963bc-e82c-447f-8e6f-7fd567f99e87',
        'Assistente Administrativo',
        'Formação inicial para rotinas administrativas, documentos e atendimento.',
        40,
        'ativo'
    ),
    (
        '3b4169fc-5a08-44aa-b03e-3b2620533378',
        'Assistente Contábil',
        'Rotinas contábeis, documentos fiscais e apoio ao setor financeiro.',
        20,
        'ativo'
    ),
    (
        '2f9a746b-70dc-4261-b150-2ec16d2b842c',
        'Assistente de RH',
        'Rotinas de recursos humanos, admissão, documentos e atendimento.',
        30,
        'ativo'
    ),
    (
        '13f6bf4a-8d9d-4e54-a5f1-5a5c4b79f111',
        'Assistente de Marketing',
        'Fundamentos de marketing, atendimento, comunicação e apoio comercial.',
        30,
        'ativo'
    ),
    (
        '0af7df27-d7cf-4d86-b1a9-4b9f4fe6c222',
        'Empreendedorismo',
        'Planejamento, validação de ideias e gestão inicial de pequenos negócios.',
        30,
        'ativo'
    )
ON CONFLICT (nome) DO NOTHING;
