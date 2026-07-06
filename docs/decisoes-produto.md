# Decisões de Produto — ADM4All

> Formato ADR-light. Última atualização: 06/07/2026.

---

## DEC-001 — Instrutores no MVP

- **Data:** 05/2026
- **Status:** Decidido
- **Contexto:** O Documento de Visão original não incluía explicitamente o
  perfil de instrutor no escopo do MVP. Durante a implementação, ficou claro
  que os fluxos de aulas, presença e materiais didáticos dependem do
  instrutor.
- **Decisão:** Incluir o perfil de instrutor no MVP com dashboard, cronograma
  de aulas, registro de presença e materiais didáticos.
- **Justificativa:** Sem o instrutor, o ciclo de aula-presença-material fica
  incompleto e os alunos não teriam conteúdo para acessar.
- **Impacto:** Aumento de escopo no backend (rotas de instrutor) e frontend
  (dashboard, sidebar, páginas de presença, cronograma, materiais).
- **Alternativas consideradas:** Deixar instrutor para V2 (rejeitado — quebraria
  o fluxo do aluno).

---

## DEC-002 — Materiais didáticos no MVP

- **Data:** 06/2026
- **Status:** Decidido
- **Contexto:** Materiais didáticos são a principal fonte de conteúdo para os
  alunos. Sem eles, o dashboard do aluno perde relevância.
- **Decisão:** Incluir materiais didáticos no MVP com:
  - Publicação pelo instrutor (com upload opcional).
  - Controle de visibilidade (`visivel_aluno`).
  - Listagem e download autenticado pelo aluno.
- **Justificativa:** Essencial para o aluno ter acesso ao conteúdo do curso.
- **Impacto:** Novas rotas de API, componente de upload, filtro de visibilidade.
- **Alternativas consideradas:** Apenas links externos (rejeitado — limita o
  controle de acesso).

---

## DEC-003 — Certificado manual no MVP

- **Data:** 06/2026
- **Status:** Decidido
- **Contexto:** O ideal seria certificado automático ao concluir o curso, mas
  isso exige definição clara da regra de elegibilidade e confirmação do PO.
- **Decisão:** Manter emissão manual pelo coordenador no MVP.
- **Justificativa:** O coordenador tem controle sobre quando e para quem
  emitir, sem depender de automação que ainda não foi validada.
- **Impacto:** Fluxo de dois passos (coordenador emite → aluno baixa).
- **Alternativas consideradas:** Automático (adiado para V2, pendente regra).

---

## DEC-004 — Elegibilidade do certificado (faltas)

- **Data:** 06/2026
- **Status:** **Pendente de confirmação PO**
- **Contexto:** A implementação atual usa faltas < 3 como critério. O Documento
  de Visão original mencionava frequência >= 80%.
- **Decisão atual (temporária):** Manter faltas < 3 até decisão final do PO.
- **Justificativa:** O limite de 2 faltas é mais restritivo e conservador.
  Alterar para frequência >= 80% mudaria o cálculo de elegibilidade para todos
  os alunos.
- **Impacto:** Se o PO confirmar frequência >= 80%, será necessário ajustar a
  regra no backend e atualizar a documentação.
- **Alternativas consideradas:** Usar frequência >= 80% desde já (adiado —
  aguarda confirmação).

---

## DEC-005 — Mensagens internas

- **Data:** 06/2026
- **Status:** Decidido
- **Contexto:** Mensagens entre perfis estava prevista no Documento de Visão.
- **Decisão:** Deixar para V2.
- **Justificativa:** Não é essencial para os ciclos centrais do MVP.
- **Impacto:** Nenhum. Funcionalidade não implementada.

---

## DEC-006 — Ex-alunos

- **Data:** 06/2026
- **Status:** Decidido
- **Contexto:** Gestão de ex-alunos estava prevista.
- **Decisão:** Deixar para V2.
- **Justificativa:** O MVP cobre o ciclo ativo do aluno. Ex-alunos é uma
  extensão natural pós-MVP.

---

## DEC-007 — Áreas em desenvolvimento (Processos, Usuários, Configurações, Cronograma)

- **Data:** 07/2026
- **Status:** Decidido
- **Contexto:** Essas áreas estavam presentes na sidebar do coordenador, mas
  os dados eram mockados.
- **Decisão:** Manter as páginas acessíveis com mensagem honesta de
  "Funcionalidade em desenvolvimento" e badge "Dev" na sidebar.
- **Justificativa:** Transparência com o usuário sobre o que está ou não
  pronto. Evita confusão entre mock e dado real.
- **Impacto:** Sidebar mantém os links, mas sem dados falsos.

---

## DEC-008 — Período letivo

- **Data:** 07/2026
- **Status:** Decidido
- **Contexto:** O dashboard exibia "2026.1" hardcoded.
- **Decisão:** Implementar cálculo automático (até 15/07 = AAAA.1, após =
  AAAA.2) com possibilidade de edição manual pelo coordenador, persistida em
  `configuracoes_sistema`.
- **Justificativa:** O período letivo é uma informação que afeta múltiplas
  telas e não deveria ser hardcoded.
- **Impacto:** Nova tabela `configuracoes_sistema`, endpoints
  `GET/PATCH /coordenador/periodo-letivo`, componente de edição no dashboard.

---

## DEC-009 — Storage de certificados

- **Data:** 07/2026
- **Status:** Decidido
- **Contexto:** PDFs de certificado estavam sendo salvos em `/uploads/`
  (público via `express.static`).
- **Decisão:** Mover para `/storage/certificados/` (pasta privada, não servida
  estaticamente). Download apenas via endpoint autenticado.
- **Justificativa:** Segurança — certificados não devem ser acessíveis sem
  autenticação.
- **Impacto:** Alteração no caminho de salvamento e leitura nos use cases de
  emissão e download.

---

## DEC-010 — Dashboard do coordenador sem mock

- **Data:** 07/2026
- **Status:** Decidido
- **Contexto:** O dashboard exibia "Próximas aulas" e "Processos em andamento"
  com dados mockados.
- **Decisão:** Remover dados mockados do dashboard. Cards mockados foram
  removidos; relatórios recentes ganhou empty state honesto.
- **Justificativa:** Dados falsos em produção minam a confiança do usuário.
- **Impacto:** Remoção de `getLessons()` e `getProcesses()` mockados do
  `Promise.all` do dashboard.
