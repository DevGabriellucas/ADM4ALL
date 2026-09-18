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
    11-adicionar-visibilidade-materiais.sql
    12-criar-configuracoes-sistema.sql
    13-inserir-configuracoes-padrao.sql
    14-criar-relatorios-gerados.sql
    15-inserir-perfis.sql
    16-inserir-cursos-padrao.sql
    17-adicionar-justificativa-frequencia.sql
    18-adicionar-avatar-coordenador-aluno.sql
    19-criar-cpfs-bloqueados.sql
  migrations/
    20260708_turma_instrutores.sql
    20260908_avatar_coordenador_aluno.sql
    20260908_frequencia_justificada.sql
    20260910_cpfs_bloqueados.sql
    20260910_encerrar_turmas_concluidas.sql
    20260916_presenca_justificada_como_presente.sql
    20260918_curso_periodo_letivo_e_status.sql
    20260918_turma_encerrada_e_aula_de_encerramento.sql
    20260918_frequencia_proporcional.sql
    20260918_remover_tabelas_sem_uso.sql
    20260918_cpf_bloqueado_em_hash.sql
    20260918_excluir_nao_bloqueia_cpf.sql
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
`16` criam a estrutura e as configurações padrão.

## Volumes Docker e persistencia de dados

- `docker compose down` **nao apaga** os dados. O volume `pgdata` permanece.
- `docker compose down -v` **apaga** o volume e todos os dados. Use com
  cuidado.
- Scripts em `database/init/` rodam apenas na **primeira criacao** do volume.
  Se o banco ja existe e voce adicionar um novo script de init, ele nao sera
  executado automaticamente.

### Aplicar migration em banco existente

Volume novo ja nasce completo pelos scripts de `init/`. **Banco que ja existe
precisa das migrations aplicadas na ordem da data**, uma por vez:

```powershell
Get-Content .\database\migrations\20260708_turma_instrutores.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260908_avatar_coordenador_aluno.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260908_frequencia_justificada.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260910_cpfs_bloqueados.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260910_encerrar_turmas_concluidas.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260916_presenca_justificada_como_presente.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260918_curso_periodo_letivo_e_status.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260918_turma_encerrada_e_aula_de_encerramento.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260918_frequencia_proporcional.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260918_remover_tabelas_sem_uso.sql | docker compose exec -T db psql -U adm4all -d adm4all
Get-Content .\database\migrations\20260918_cpf_bloqueado_em_hash.sql | docker compose exec -T db psql -U adm4all -d adm4all -v pepper="$env:CPF_HASH_SECRET"
Get-Content .\database\migrations\20260918_excluir_nao_bloqueia_cpf.sql | docker compose exec -T db psql -U adm4all -d adm4all
```

Todas sao idempotentes (`IF EXISTS` / `IF NOT EXISTS`), entao rodar de novo nao
quebra nada.

**`20260918_cpf_bloqueado_em_hash.sql` e a unica que precisa de argumento.** O
`-v pepper=` tem que trazer exatamente o mesmo valor de `CPF_HASH_SECRET` que o
backend usa, senao os bloqueios ja gravados param de bater e quem estava
bloqueado consegue se cadastrar de novo. Sem a variavel o psql para em "pepper
is not defined", de proposito: rodar sem o segredo certo apagaria os bloqueios
em silencio. Como o CPF de origem deixa de existir depois da migration, nao ha
como recalcular o hash — trocar o segredo depois significa aceitar zerar a
lista.

A ordem entre estas duas importa: `20260908_frequencia_justificada.sql`
cria a constraint que impede presenca marcada como justificada, e
`20260916_presenca_justificada_como_presente.sql` e quem a remove. Um banco que
receba so a primeira recusa a chamada com falta justificada — o sistema avisa
qual migration falta em vez de devolver erro generico, mas a chamada nao salva
enquanto isso nao for corrigido.

| Migration | O que faz |
| --- | --- |
| `20260708_turma_instrutores.sql` | Vinculo de instrutores por turma |
| `20260908_avatar_coordenador_aluno.sql` | Foto de perfil de coordenacao e aluno |
| `20260908_frequencia_justificada.sql` | Coluna `justificada` em `frequencias` |
| `20260910_cpfs_bloqueados.sql` | Cria a lista de CPFs bloqueados (naquela data, alimentada pela exclusao de aluno) |
| `20260910_encerrar_turmas_concluidas.sql` | Encerramento automatico de turma |
| `20260916_presenca_justificada_como_presente.sql` | Libera justificada com credito de presenca |
| `20260918_curso_periodo_letivo_e_status.sql` | Periodo letivo do curso; status do curso passa a sair das turmas |
| `20260918_turma_encerrada_e_aula_de_encerramento.sql` | Turma passa a "encerrada" no fim do cronograma; presenca automatica na aula 10 |
| `20260918_frequencia_proporcional.sql` | Frequencia vira creditos/chamadas; reavalia matriculas e certificados ja gravados |
| `20260918_remover_tabelas_sem_uso.sql` | Derruba `avaliacoes` e `documentos_aluno`, que nenhum codigo lia ou escrevia |
| `20260918_cpf_bloqueado_em_hash.sql` | `cpfs_bloqueados` passa a guardar so o HMAC do CPF; nome e e-mail saem (**precisa de `-v pepper=`**) |
| `20260918_excluir_nao_bloqueia_cpf.sql` | Tira da lista os CPFs que entraram por exclusao: agora so o botao "Bloquear" bloqueia |

## Resetar o banco local

```bash
docker compose down -v
docker compose up -d
```

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
\d+ configuracoes_sistema
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
| `ativacoes_conta` | Tokens de ativacao de conta para convites e cadastro publico |
| `alunos` | Dados academicos do aluno vinculado a um usuario |
| `instrutores` | Dados dos instrutores vinculados a usuarios |
| `coordenadores` | Dados de coordenacao vinculados a usuarios |
| `treinamentos` | Cursos/treinamentos oferecidos |
| `turmas` | Turmas abertas por treinamento e coordenador |
| `turma_instrutores` | Vinculo muitos-para-muitos entre turmas e instrutores |
| `matriculas` | Vinculo entre aluno, treinamento e turma, com status e progresso |
| `aulas` | Cronograma de aulas das turmas |
| `frequencias` | Presencas e faltas por matricula/aula |
| `avaliacoes` | Notas por matricula |
| `materiais` | Materiais publicados para as turmas |
| `documentos_aluno` | Controle de documentos pendentes/enviados/aprovados |
| `certificados` | Certificados emitidos para matriculas concluidas |
| `configuracoes_sistema` | Parametros ajustaveis da aplicacao (periodo letivo, etc.) |

## Qualidade dos dados

O schema reforca regras importantes:

- CPF de usuario com 11 digitos e nao repetido.
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

## Arquivos de materiais do seed

O seed cadastra materiais que apontam para arquivos reais em
`/uploads/materiais/`. Como `backend/uploads/` e ignorado pelo Git, os arquivos
de exemplo ficam versionados em `database/seeds/materiais-exemplo/` e precisam
ser copiados apos clonar o repositorio:

```bash
mkdir -p backend/uploads/materiais
cp database/seeds/materiais-exemplo/* backend/uploads/materiais/
```

Sem essa copia, "Abrir material" responde 404 — os registros existem no banco
mas os arquivos nao existem em disco.

Atencao ao formato do caminho: o upload real grava `/uploads/materiais/<uuid>`,
e o `express.static` so serve `/uploads/avatares`. Material sai pelas rotas
autenticadas de download, que conferem o vinculo do usuario com a turma.

## Seed de desenvolvimento

**Os dados de teste nao rodam mais automaticamente.** Eles sairam de
`database/init/` e vivem em `database/seeds/dev/`, para nenhuma instalacao
nascer com usuarios de senha conhecida.

O que `database/init/` cria num banco novo:

- arquivos `01` a `12`: as tabelas e constraints;
- `13-inserir-configuracoes-padrao.sql`: periodo letivo, dados da instituicao
  e regras de certificado;
- `14-criar-relatorios-gerados.sql`: tabela de relatorios persistidos;
- `15-inserir-perfis.sql`: os 4 perfis de acesso (**estrutura**, nao dado de
  teste — sem eles nenhum usuario pode ser criado);
- `16-inserir-cursos-padrao.sql`: os 5 cursos (o cadastro publico exige
  escolher um treinamento; sem nenhum, o aluno nao consegue se inscrever).

Resultado: **zero usuarios, zero turmas, zero matriculas**. Para criar a
primeira conta, veja `database/seeds/producao/README.md`.

### Ambientes de desenvolvimento

Os scripts de teste foram removidos do repositório antes do go-live (19/09/2026).

**NUNCA rode dados de teste em produção.** O banco de produção foi limpo propositalmente para não nascer com credenciais conhecidas.
