-- Perfis de acesso do sistema.
--
-- Isto NAO e dado de teste: os quatro perfis sao estrutura fixa (a propria
-- tabela tem CHECK restringindo os nomes) e a coluna usuarios.perfil_id
-- referencia esta tabela. Sem estas linhas nenhum usuario pode ser criado e
-- o sistema fica inutilizavel.
--
-- Os UUIDs sao fixos de proposito, para os seeds de desenvolvimento e
-- qualquer script auxiliar poderem referenciar os perfis diretamente.

INSERT INTO perfis (id, nome, descricao, nivel_acesso)
VALUES
    ('f2b625c7-acbe-4b14-9046-c80c4a04eda4', 'aluno', 'Acesso do aluno ao proprio curso', 10),
    ('36e6ad50-2a3f-4500-bd1f-0cd799d4207d', 'instrutor', 'Acesso do instrutor as turmas e presencas', 40),
    ('29b6bec8-1701-463e-95af-c4eaf026ed7f', 'coordenador', 'Acesso de coordenacao aos cursos, turmas e relatorios', 70),
    ('dd3f203e-b35b-4065-af3a-c78af1852159', 'admin', 'Acesso administrativo geral e configuracoes', 100)
ON CONFLICT (nome) DO NOTHING;
