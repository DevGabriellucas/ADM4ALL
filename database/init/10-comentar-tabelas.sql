-- Comentarios de documentacao exibidos em ferramentas como psql/Adminer.

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
COMMENT ON TABLE avaliacoes IS 'Notas lancadas por matricula';
COMMENT ON TABLE materiais IS 'Materiais publicados para uma turma';
COMMENT ON TABLE documentos_aluno IS 'Controle de documentos obrigatorios do aluno';
COMMENT ON TABLE certificados IS 'Certificados gerados para matriculas concluidas';
