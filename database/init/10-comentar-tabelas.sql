-- Comentarios de documentacao exibidos em ferramentas como psql/Adminer.
--
-- Cada linha aqui precisa corresponder a uma tabela criada nos scripts
-- anteriores. O Postgres roda este diretorio com ON_ERROR_STOP=1: um COMMENT
-- sobre tabela inexistente nao e aviso, e o fim da inicializacao — o container
-- sai com erro e o banco fica vazio. Foi o que aconteceu com `avaliacoes` e
-- `documentos_aluno`, removidas em 18/09/2026 e esquecidas aqui.

COMMENT ON TABLE perfis IS 'Perfis de acesso da plataforma';
COMMENT ON TABLE usuarios IS 'Usuarios que podem autenticar no sistema';
COMMENT ON TABLE recuperacoes_senha IS 'Tokens de recuperacao de senha com expiracao de 15 minutos';
COMMENT ON TABLE alunos IS 'Alunos cadastrados na plataforma ADM4All';
COMMENT ON TABLE instrutores IS 'Instrutores responsaveis por turmas e aulas';
COMMENT ON TABLE coordenadores IS 'Coordenadores responsaveis por cursos e turmas';
COMMENT ON TABLE treinamentos IS 'Cursos/treinamentos oferecidos pela plataforma';
COMMENT ON TABLE turmas IS 'Turmas abertas para um treinamento';
COMMENT ON TABLE matriculas IS 'Vinculo entre aluno, treinamento e turma, com status e progresso';
COMMENT ON TABLE aulas IS 'Cronograma de aulas por turma';
COMMENT ON TABLE frequencias IS 'Registro de presencas e faltas por matricula/aula';
COMMENT ON TABLE materiais IS 'Materiais publicados para uma turma';
COMMENT ON TABLE certificados IS 'Certificados gerados para matriculas concluidas';
