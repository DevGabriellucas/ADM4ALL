# Pendencias Pos-MVP - ADM4All

> Ultima atualizacao: 09/07/2026.

| Prioridade | Item | Motivo | Dependencias | Observacao |
|---|---|---|---|---|
| Alta | Confirmar regra final de elegibilidade do certificado | Pode haver diferenca entre regra de faltas e regra por frequencia minima | Decisao do PO | Ver `docs/decisoes-produto.md` |
| Alta | Confirmar provedor SMTP final | Producao deve usar conta/provedor oficial da instituicao | Conta SMTP oficial + DNS SPF/DKIM/DMARC | App ja aceita SMTP customizado; ver `docs/producao-storage-smtp.md` |
| Alta | Backup de uploads e certificados | Volumes persistentes precisam de rotina de backup | Infraestrutura | `UPLOADS_DIR` e `STORAGE_DIR` ja sao configuraveis |
| Media | Ampliar testes E2E | Aumentar confianca da regressao alem do smoke inicial | Playwright | Smoke inicial cobre login, cadastro, recuperar/redefinir senha, cronograma e materiais |
| Media | Testes de frontend | Cobrir componentes e formularios React | Jest/Vitest + Testing Library | Atualmente sem suite automatizada no frontend |
| Media | Cobertura dos limites de frequencia | Garantir badges em atencao/risco/reprovado | Jest/backend + seeds | Especialmente thresholds 75/80 |
| Media | Auditoria e permissoes avancadas de usuarios | A tela de Usuarios existe no MVP, mas sem trilha completa de auditoria | Backend + UI | Pos-MVP de seguranca/governanca |
| Media | Configuracoes administrativas completas | A tela de Configuracoes existe, mas pode crescer com parametros do sistema | Regras aprovadas pelo PO | MVP cobre dados essenciais |
| Media | Certificado automatico | Emissao sem acao manual do coordenador | Regra final do PO + job/evento | Hoje emissao e manual |
| Media | Emissao em lote de certificados | Agilizar turmas concluidas com muitos alunos | UI + backend | Pos-MVP |
| Media | Cronograma geral do coordenador | Visao consolidada de todas as aulas | Endpoints e desenho de produto | Fora do menu do MVP atual |
| Media | Processos administrativos | Controle interno previsto para evolucao | Backend + frontend | Fora do menu do MVP atual |
| Media | Mensagens internas | Comunicacao entre perfis prevista no Documento de Visao | Backend + frontend de mensagens | V2 |
| Media | Ex-alunos | Gestao de egressos | Nova modelagem e fluxos | V2 |
| Baixa | Padronizacao visual global de badges/status | Consistencia fina entre todos os componentes | Refatoracao CSS/Tailwind | Feito parcialmente |
| Baixa | CI/CD | Build, lint e testes automatizados | GitHub Actions ou GitLab CI | Nao configurado |
| Baixa | Logs estruturados | Melhorar observabilidade de producao | Infraestrutura | Logs atuais sao basicos |
| Baixa | Edicao/exclusao de cursos | Acoes rapidas da tabela ainda podem evoluir | Frontend + backend | Criar/listar ja funcionam |
| Baixa | Edicao/exclusao de turmas | Acoes rapidas da tabela ainda podem evoluir | Frontend + backend | Criar/listar/detalhe ja funcionam |
| Baixa | Expandir alunos de teste | Demonstrar combinacoes adicionais de status/documentos | Seed SQL | Seed extra MVP ja cobre badges principais e estados de certificado |
