# Banco de dados - ADM4All

Banco **PostgreSQL 16** rodando em Docker para armazenar dados da plataforma.
O compose oficial do projeto fica na raiz do repositorio.

## Estrutura

```text
database/
  README.md
  docs/
    modelo-entidade-relacionamento.md
  init/
    01-habilitar-extensoes.sql
    02-criar-perfis.sql
    03-criar-alunos.sql
    04-criar-usuarios-e-recuperacao-senha.sql
    05-criar-equipe-academica.sql
    06-criar-cursos-e-turmas.sql
    07-criar-matriculas-e-aulas.sql
    08-criar-acompanhamento-aluno.sql
    09-criar-materiais-e-certificados.sql
    10-comentar-tabelas.sql
    20-inserir-dados-teste.sql
```

## Como subir

Pre-requisito: **Docker Desktop** instalado e rodando.

Execute na raiz do projeto:

```bash
cp .env.example .env
docker compose up -d
docker compose ps
```

O arquivo `database/docker-compose.yml` foi removido para evitar dois bancos
locais diferentes. Use sempre o `docker-compose.yml` da raiz.

Os arquivos em `database/init/` sao numerados porque o Postgres executa tudo
em ordem alfabetica na primeira inicializacao. Por isso os arquivos `01` a
`10` criam a estrutura, e o arquivo `20` insere os dados de teste.

## Resetar o banco local

Os scripts em `database/init/` rodam apenas na primeira criacao do volume do
Postgres. Se mudar schema ou seed e quiser recriar tudo:

```bash
docker compose down -v
docker compose up -d
```

O `-v` apaga o volume `pgdata` e todos os dados locais.

## Acessar os dados

Adminer: http://localhost:8080

| Campo | Valor |
|---|---|
| Sistema | PostgreSQL |
| Servidor | `db` |
| Usuario | `adm4all` |
| Senha | `adm4all_dev` |
| Base | `adm4all` |

Via psql:

```bash
docker compose exec db psql -U adm4all -d adm4all
```

Comandos uteis dentro do `psql`:

```sql
\dt
\d+ usuarios
\d+ alunos
\d+ turmas
\d+ aulas
\d+ matriculas
```

## Modelo de dados

O modelo principal esta documentado em
[docs/modelo-entidade-relacionamento.md](docs/modelo-entidade-relacionamento.md).

Tabelas criadas:

| Tabela | Finalidade |
|---|---|
| `perfis` | Perfis de acesso: aluno, instrutor, coordenador e admin |
| `usuarios` | Identidade central de autenticacao por e-mail ou CPF |
| `recuperacoes_senha` | Tokens de recuperacao de senha com validade de 15 minutos |
| `alunos` | Dados academicos do aluno vinculado a um usuario |
| `instrutores` | Dados dos instrutores vinculados a usuarios |
| `coordenadores` | Dados de coordenacao vinculados a usuarios |
| `treinamentos` | Cursos/treinamentos oferecidos |
| `turmas` | Turmas abertas por treinamento, instrutor e coordenador |
| `matriculas` | Vinculo entre aluno, treinamento e turma, com status e progresso |
| `aulas` | Cronograma de aulas das turmas |
| `frequencias` | Presencas e faltas por matricula/aula |
| `avaliacoes` | Notas por matricula |
| `materiais` | Materiais publicados para as turmas |
| `documentos_aluno` | Controle de documentos pendentes/enviados/aprovados |
| `certificados` | Certificados emitidos para matriculas concluidas |

## Qualidade dos dados

O schema reforca regras importantes:

- CPF de usuario com 11 digitos e nao repetido, como `11111111111`.
- Telefone com 10 ou 11 digitos.
- Email de usuario em minusculo, sem espacos e unico ignorando maiusculas/minusculas.
- Nome, treinamento e tipos de documento nao podem ser texto vazio.
- Aluno Unipe precisa ter `curso_unipe` e `rgm`; aluno externo nao deve ter esses campos.
- Usuario precisa ter perfil valido e status padronizado.
- Token de recuperacao de senha nao pode ser vazio e expira por padrao em 15 minutos.
- Turma precisa ter codigo unico, capacidade positiva e datas consistentes.
- Aula precisa ter numero positivo, status valido e horario final maior que inicial.
- Progresso da matricula deve ficar entre 0 e 100.
- Status de matricula e documento usa lista fechada de valores.
- Nota de avaliacao deve ficar entre 0 e 10.
- Certificado emitido precisa ter data de emissao.

## Recuperacao de senha

A tabela `recuperacoes_senha` guarda as solicitacoes de recuperacao de senha.
O campo `token_hash` deve receber apenas o hash do token, nunca o token puro.

Regra esperada no backend:

```sql
SELECT 1
FROM recuperacoes_senha
WHERE usuario_id = $1
  AND solicitado_em > now() - interval '15 minutes'
LIMIT 1;
```

Se essa consulta retornar registro, o backend nao deve gerar outro token. Se
nao retornar, pode criar uma nova solicitacao com `expira_em = now() + interval
'15 minutes'`.

## Seed de desenvolvimento

O arquivo `init/20-inserir-dados-teste.sql` cria dados para testar cenarios reais:

- perfis de aluno, instrutor, coordenador e admin;
- usuarios para cada perfil;
- instrutor e coordenadora;
- turma e cronograma de aulas;
- aluno em andamento;
- aluno aprovado;
- aluno reprovado por falta;
- materiais de turma;
- documentos aprovados e pendentes;
- frequencias, avaliacoes e certificado emitido.

Esse seed nao e outro banco. Ele apenas popula o banco local criado pelo
compose da raiz.
