-- Remove duas tabelas que nenhuma linha de codigo le ou escreve.
--
-- `avaliacoes` e `documentos_aluno` nasceram no init (08-criar-acompanhamento-
-- aluno.sql) e nunca ganharam tela, rota ou repositorio. As duas estavam vazias
-- quando esta migration foi escrita.
--
-- `documentos_aluno` guardaria documento pessoal de aluno: tirar a tabela que
-- ninguem preenche e tambem minimizacao de dado, e nao so faxina.
--
-- Se um dia houver nota ou documento no sistema, a tabela volta pelo caminho
-- normal: um script novo em migrations/ junto do codigo que a usa.

DROP TABLE IF EXISTS avaliacoes;
DROP TABLE IF EXISTS documentos_aluno;
