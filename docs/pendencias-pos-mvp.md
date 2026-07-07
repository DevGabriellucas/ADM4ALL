# Pendências Pós-MVP — ADM4All

> Última atualização: 06/07/2026.

| Prioridade | Item | Motivo | Dependências | Observação |
|---|---|---|---|---|
| Alta | Confirmar regra de elegibilidade do certificado | Divergência entre faltas < 3 (implementado) e frequência >= 80% (Doc. de Visão) | Decisão do PO | Ver `docs/decisoes-produto.md` DEC-004 |
| Alta | Cookie HttpOnly para JWT | Segurança — token acessível via JavaScript no MVP atual | Refatoração do fluxo de sessão | Cookie atual é setado pelo cliente |
| Alta | Remover/transicionar `x-api-key` | Rotas administrativas de alunos ainda usam API key legada | Migrar para JWT por perfil | Rotas: GET/PUT/DELETE `/alunos/:id` |
| Alta | SMTP de produção | E-mails de ativação e recuperação dependem de credenciais reais | Configuração de servidor SMTP | Gmail App Password funciona em dev |
| Alta | Storage externo para uploads | Arquivos salvos em volume local do container | S3, MinIO ou volume persistente | Hoje: `uploads/` e `storage/` locais |
| Média | Mensagens internas | Comunicação entre perfis prevista no Doc. de Visão | Backend + frontend de chat/mensagens | V2 |
| Média | Ex-alunos | Gestão de egressos | Nova tabela e fluxos | V2 |
| Média | Gestão centralizada de usuários | Tela de administração de todos os usuários do sistema | Backend + frontend | Página existe como "Em desenvolvimento" |
| Média | Processos administrativos | Controle de processos internos | Backend + frontend | Página existe como "Em desenvolvimento" |
| Média | Configurações administrativas completas | Preferências do sistema além do período letivo | Backend + frontend | Página existe como "Em desenvolvimento" |
| Média | Certificado automático | Emissão sem ação do coordenador | Decisão do PO + regra de elegibilidade | V2 |
| Média | Emissão em lote de certificados | Emitir para múltiplos alunos de uma vez | UI + backend | Pós-MVP |
| Média | Cronograma geral do coordenador | Visão consolidada de todas as aulas | Integração com endpoints de aula | Página existe como "Em desenvolvimento" |
| Média | Testes de frontend | Cobertura de componentes React | Jest + React Testing Library | Atualmente zero testes de frontend |
| Média | Testes E2E | Fluxos completos automatizados | Cypress ou Playwright | Não implementado |
| Média | Cobertura de testes dos limites de frequência | Testes unitários para os thresholds 75/80 | Jest | Backend tem 26 testes, mas sem cobertura específica de thresholds |
| Baixa | Padronização visual global de badges/status | Consistência entre todos os componentes | Refatoração de CSS/Tailwind | Feito parcialmente (CoordinatorStatusBadge com orange) |
| Baixa | CI/CD | Build, lint e testes automatizados | GitHub Actions ou GitLab CI | Não configurado |
| Baixa | Backups e logs | Rotina de backup do banco e logs estruturados | Infraestrutura | Não implementado |
| Baixa | Edição/exclusão de cursos | Ações rápidas da tabela de cursos desabilitadas | Frontend + backend | Criar e listar já funcionam |
| Baixa | Edição/exclusão de turmas | Ações rápidas da tabela de turmas desabilitadas | Frontend + backend | Criar, listar e detalhe já funcionam |
| Baixa | Novos alunos de teste | Cenários como atenção (75-79%), risco (<75%), certificado cancelado | Seed SQL | Tarefa separada de seed |
