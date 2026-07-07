# ADM4All

Sistema web para gestão do projeto **Administração para Todos**, com perfis de
coordenador, instrutor e aluno.

## Visão geral

O ADM4All gerencia o ciclo acadêmico completo de cursos de extensão:
matrícula de alunos, cronograma de aulas, registro de frequência, materiais
didáticos, emissão de certificados e relatórios gerenciais.

## Perfis do sistema

| Perfil | Descrição |
|---|---|
| **Coordenador/Admin** | Dashboard com indicadores, gestão de cursos, turmas, alunos, instrutores, frequência, certificados, relatórios e período letivo. |
| **Instrutor** | Dashboard da turma, cronograma de aulas, registro de presença, materiais didáticos e avatar. |
| **Aluno** | Dashboard pessoal com progresso e frequência, download de materiais e certificado. |

## Principais funcionalidades do MVP

- Autenticação JWT com login por e-mail ou CPF e redirecionamento por perfil.
- Dashboard do coordenador com indicadores reais (sem dados mockados).
- Período letivo dinâmico/editável.
- Emissão manual de certificados pelo coordenador.
- Download autenticado de certificados e materiais pelo aluno.
- Relatórios acadêmicos com filtros, gráfico, exportação em PDF e CSV.
- Cronograma de aulas e registro de presença pelo instrutor.
- Controle de visibilidade de materiais didáticos.

## Funcionalidades em desenvolvimento

Áreas com badge "Dev" na sidebar do coordenador:
- Cronograma geral
- Processos administrativos
- Gestão de usuários
- Configurações completas

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Banco de dados | PostgreSQL 16 |
| Infraestrutura | Docker, Docker Compose |

## Como rodar localmente

Consulte os READMEs específicos:

- [Backend](backend/README.md)
- [Banco de dados](database/README.md)

Resumo rápido:

```bash
cp .env.example .env
docker compose up -d --build
cd backend && npm install && npm run start:dev
cd frontend && npm install && npm run dev
```

## Documentação

- [Escopo do MVP](docs/mvp-escopo.md)
- [Decisões de produto](docs/decisoes-produto.md)
- [Roteiro de validação](docs/roteiro-validacao-mvp.md)
- [Pendências pós-MVP](docs/pendencias-pos-mvp.md)
- [Divergências com o Documento de Visão](docs/divergencias-documento-de-visao.md)
- [Casos de teste — alunos (seed)](docs/seed-casos-teste.md)
- [Guia de testes para apresentação](docs/guia-de-testes-para-apresentacao.md)
- [Modelo entidade-relacionamento](database/docs/modelo-entidade-relacionamento.md)
