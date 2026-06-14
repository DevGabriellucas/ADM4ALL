# Banco de dados — ADM4All

Banco **PostgreSQL 16** rodando em Docker, para armazenar os dados da
plataforma (hoje: tabela `alunos`). Substitui o `InMemoryAlunoRepository`
(que perdia tudo ao reiniciar o back-end).

## Estrutura

```
database/
  ├─ docker-compose.yml     # sobe Postgres + Adminer
  ├─ .env.example           # variáveis de conexão (copiar para .env)
  ├─ README.md              # este arquivo
  └─ init/
     ├─ 01-schema.sql       # criação da tabela alunos (constraints + índices)
     └─ 02-seed.sql         # dados de exemplo (somente dev)
```

## Como subir

Pré-requisito: **Docker Desktop** instalado e rodando.

```bash
# 1. Entre na pasta do banco
cd database

# 2. Crie seu .env a partir do exemplo
cp .env.example .env

# 3. Suba o banco (e o Adminer)
docker compose up -d

# 4. Veja se está saudável
docker compose ps
```

> Os scripts em `init/` rodam **apenas na primeira vez**, quando o
> volume `pgdata` ainda está vazio. Se mudar o schema e quiser recriar do
> zero, rode `docker compose down -v` (o `-v` apaga o volume e os dados).

## Acessar os dados

**Adminer (interface web):** http://localhost:8080

| Campo    | Valor                         |
|----------|-------------------------------|
| Sistema  | PostgreSQL                    |
| Servidor | `db`                          |
| Usuário  | `adm4all` (ou seu POSTGRES_USER) |
| Senha    | `adm4all_dev` (ou sua POSTGRES_PASSWORD) |
| Base     | `adm4all`                     |

**psql (linha de comando):**

```bash
docker compose exec db psql -U adm4all -d adm4all
# dentro do psql:  \dt   (lista tabelas)   \d+ alunos   (detalha a tabela)
```

## Conectar o back-end

O back-end (TypeScript/Express) deve usar a `DATABASE_URL` do `.env`:

```
postgresql://adm4all:adm4all_dev@localhost:5432/adm4all
```

Próximo passo do time de back: criar um `PostgresAlunoRepository` que
implemente a interface [`AlunoRepository`](../backend/src/domain/repositories/AlunoRepository.ts)
usando o driver `pg` (`npm i pg`), e trocar a injeção em
[`main.ts`](../backend/src/main.ts) do `InMemoryAlunoRepository` para ele.

## Tabela `alunos`

Espelha a entidade [`Aluno`](../backend/src/domain/entities/Aluno.ts). Colunas
em `snake_case` (padrão SQL); o back mapeia para `camelCase`.

| Coluna            | Tipo           | Regras                                   |
|-------------------|----------------|------------------------------------------|
| `id`              | UUID (PK)      | gerado automático (`gen_random_uuid()`)  |
| `nome`            | VARCHAR(255)   | obrigatório                              |
| `cpf`             | VARCHAR(11)    | único, 11 dígitos                        |
| `telefone`        | VARCHAR(11)    | 10 ou 11 dígitos (com DDD)               |
| `email`           | VARCHAR(255)   | único                                    |
| `data_nascimento` | DATE           | obrigatório                              |
| `is_aluno_unipe`  | BOOLEAN        | default `false`                          |
| `curso_unipe`     | VARCHAR(255)   | obrigatório se `is_aluno_unipe = true`   |
| `senha`           | VARCHAR(255)   | **hash bcrypt** (nunca texto puro)       |
| `treinamento`     | VARCHAR(255)   | obrigatório                              |
| `rgm`             | VARCHAR(8)     | único, 8 dígitos; obrigatório se Unipê   |
| `data_cadastro`   | TIMESTAMPTZ    | default `now()`                          |

As validações do domínio (CPF/telefone/RGM só dígitos, regra do Unipê)
também são reforçadas por `CHECK constraints` no banco.
