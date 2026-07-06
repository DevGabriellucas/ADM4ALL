# Escopo do MVP — ADM4All

> Última atualização: 06/07/2026.

## 1. Objetivo do MVP

O MVP do ADM4All entrega um sistema web funcional para gestão do projeto
Administração para Todos, com três perfis de usuário e persistência real em
PostgreSQL. O foco é fechar os ciclos centrais de autenticação, matrícula,
frequência, materiais didáticos, certificados e relatórios, sem dependência de
dados simulados no dashboard.

## 2. Perfis contemplados

### Coordenador/Admin

- Dashboard com indicadores reais (total de alunos, turmas ativas, frequência
  média, certificados emitidos, ativações pendentes).
- Alunos em atenção com situação visual diferenciada (regular, atenção, risco
  de reprovação, reprovado por falta).
- Relatórios recentes com empty state honesto e link para `/coordenador/relatorios`.
- Período letivo dinâmico/editável (cálculo automático AAAA.1/AAAA.2, com
  possibilidade de edição manual persistida).
- Gestão de cursos, turmas, alunos, instrutores, frequência.
- Emissão, visualização, download e cancelamento de certificados.
- Seis tipos de relatórios acadêmicos com filtros, gráfico, PDF e CSV.
- Sidebar com áreas em desenvolvimento sinalizadas com badge "Dev".
- Áreas Cronograma, Processos, Usuários e Configurações como páginas honestas
  de funcionalidade em desenvolvimento (sem dados mockados).

### Instrutor

- Dashboard com indicadores da turma (alunos, presentes, frequência média,
  próxima aula).
- Cronograma de aulas com criação, edição e remoção (API real).
- Registro de presença dos alunos por aula.
- Publicação de materiais didáticos com upload opcional.
- Controle de visibilidade de materiais para o aluno.
- Atualização de avatar (foto de perfil).

### Aluno

- Dashboard com status da matrícula, progresso, frequência e faltas.
- Diferentes estados visuais conforme situação (em andamento, aprovado,
  reprovado por falta).
- Download autenticado do certificado (PDF gerado e salvo em storage privado).
- Listagem de materiais visíveis das turmas em que está matriculado.
- Download autenticado de materiais.

## 3. Funcionalidades dentro do MVP

| Funcionalidade | Perfis | Estado |
|---|---|---|
| Autenticação JWT com login por e-mail/CPF | Todos | Integrado |
| Redirecionamento por perfil | Todos | Integrado |
| Recuperação e redefinição de senha | Todos | Integrado |
| Cadastro público e ativação de conta | Aluno | Integrado |
| Dashboard com dados reais | Coordenador, Instrutor, Aluno | Integrado |
| Período letivo dinâmico/editável | Coordenador | Integrado |
| Gestão de cursos | Coordenador | Parcial (criar e listar) |
| Gestão de turmas | Coordenador | Parcial (criar, listar e detalhe) |
| Gestão de alunos e matrículas | Coordenador | Integrado |
| Convite de aluno e instrutor | Coordenador | Integrado |
| Frequência consolidada | Coordenador | Integrado |
| Emissão de certificados (manual) | Coordenador | Integrado |
| Relatórios com PDF e CSV | Coordenador | Integrado |
| Cronograma de aulas | Instrutor | Integrado |
| Registro de presença | Instrutor | Integrado |
| Materiais didáticos com visibilidade | Instrutor, Aluno | Integrado |
| Avatar do instrutor | Instrutor | Integrado |
| Download autenticado de certificado | Aluno | Integrado |
| Download autenticado de materiais | Aluno | Integrado |
| Segurança: CPF não exposto em JSON | Todos | Integrado |
| Segurança: storage privado de certificados | Backend | Integrado |

## 4. Funcionalidades fora do MVP

| Funcionalidade | Previsão |
|---|---|
| Mensagens internas | V2 |
| Ex-alunos | V2 |
| Processos administrativos completos | V2 |
| Gestão centralizada de usuários | V2 |
| Configurações administrativas completas | V2 |
| Certificado automático (sem ação do coordenador) | V2 |
| Emissão em lote de certificados | V2 |
| Cronograma geral do coordenador (visão consolidada) | V2 |
| Auditoria, backup e storage externo | V2 |
| CI/CD | V2 |
| Testes E2E e de frontend | V2 |
| SMTP de produção | Pré-produção |
| Cookie HttpOnly para JWT | Pré-produção |

## 5. Observações de escopo

- **Instrutores e Materiais** foram reclassificados como parte do MVP porque o
  fluxo real de aulas, presença e materiais didáticos depende deles.
- **Certificado** permanece com emissão manual pelo coordenador. A
  automatização depende de confirmação de regra de elegibilidade com o PO.
- **Elegibilidade** atual do certificado usa o critério de faltas < 3. O
  Documento de Visão original mencionava frequência >= 80%. Esta divergência
  está documentada em `docs/decisoes-produto.md` e `docs/divergencias-documento-de-visao.md`.
- **Período letivo** é calculado automaticamente (até 15/07 = AAAA.1, após =
  AAAA.2) e pode ser editado manualmente pelo coordenador. Valor persistido em
  `configuracoes_sistema`.
