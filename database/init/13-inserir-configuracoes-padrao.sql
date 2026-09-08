-- Inserir configurações padrão do sistema
INSERT INTO configuracoes_sistema (chave, valor, descricao, atualizado_em)
VALUES
  ('instituicao_nome', 'ADM4All', 'Nome da instituição exibido em certificados e relatórios', NOW()),
  ('instituicao_email', 'unipeadm4all@gmail.com', 'E-mail de contato da instituição', NOW()),
  ('instituicao_telefone', '(83) 98871-6106', 'Telefone da instituição', NOW()),
  ('instituicao_cidade', 'João Pessoa', 'Cidade da instituição', NOW()),
  ('instituicao_uf', 'PB', 'UF da instituição', NOW()),
  ('periodo_letivo', '2026.1', 'Período letivo atual (formato: YYYY.S)', NOW()),
  ('certificado_maximo_faltas', '2', 'Máximo de faltas permitido para certificado', NOW()),
  ('certificado_apenas_encerrada', 'false', 'Emitir certificado apenas para turmas encerradas', NOW()),
  ('preferencias_capacidade_padrao', '30', 'Capacidade padrão de nova turma', NOW()),
  ('preferencias_status_padrao', 'planejada', 'Status padrão de nova turma', NOW()),
  ('preferencias_nome_exibido', 'ADM4All', 'Nome exibido no painel', NOW())
ON CONFLICT (chave) DO NOTHING;
