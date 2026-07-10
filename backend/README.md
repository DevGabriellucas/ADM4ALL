# Backend - ADM4All

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Bcrypt

## Como rodar

1. Crie o `.env` na raiz do projeto a partir de `.env.example`.
2. Instale as dependencias:

```bash
npm install
```

3. Rode em desenvolvimento:

```bash
npm run start:dev
```

Variaveis usadas pelo backend:

| Variavel | Uso |
|---|---|
| `DATABASE_URL` | String de conexao do PostgreSQL |
| `FRONTEND_URL` | Origem liberada no CORS e base do link de recuperacao de senha |
| `JWT_SECRET` | Segredo usado para assinar tokens de login |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Credenciais Gmail para envio em desenvolvimento |
| `EMAIL_HOST` / `EMAIL_PORT` | SMTP customizado para homologacao/producao |
| `EMAIL_FROM_NAME` / `EMAIL_FROM` | Nome e remetente dos e-mails enviados |
| `UPLOADS_DIR` | Diretorio persistente para uploads de materiais e avatares |
| `STORAGE_DIR` | Diretorio persistente para certificados gerados |

## Autorizacao

O login retorna um token JWT simples, assinado com `JWT_SECRET`.
Nas rotas protegidas por perfil, envie:

```http
Authorization: Bearer token_recebido_no_login
```

## Contrato da API

| Metodo | Endpoint | Protecao | Descricao |
|---|---|---|---|
| POST | `/auth/login` | Publica | Realiza login e retorna token/perfil |
| POST | `/auth/recuperar-senha` | Publica | Solicita recuperacao de senha |
| POST | `/auth/redefinir-senha` | Publica | Redefine a senha a partir do token recebido por e-mail |
| POST | `/alunos` | Publica | Cadastra novo aluno |
| GET | `/alunos` | `Bearer` coordenador/admin | Lista alunos |
| GET | `/alunos/:id` | `Bearer` coordenador/admin | Busca aluno por ID |
| PUT | `/alunos/:id` | `Bearer` coordenador/admin | Atualiza cadastro de aluno |
| DELETE | `/alunos/:id` | `Bearer` coordenador/admin | Remove aluno |
| GET | `/alunos/me/dashboard` | `Bearer` aluno | Dashboard do aluno |
| GET | `/alunos/me/materiais` | `Bearer` aluno | Lista materiais visiveis do aluno |
| GET | `/alunos/me/materiais/:materialId/download` | `Bearer` aluno | Download autenticado de material |
| GET | `/alunos/me/certificado/pdf` | `Bearer` aluno | Download autenticado do certificado (PDF) |
| GET | `/instrutores/:id/dashboard` | `Bearer` instrutor/coordenador/admin | Dashboard do instrutor |
| POST | `/instrutores/:id/avatar` | `Bearer` instrutor/coordenador/admin | Atualiza a foto de perfil do instrutor |
| POST | `/turmas/:turmaId/presencas` | `Bearer` instrutor/coordenador/admin | Registra presencas da turma |
| GET | `/turmas/:turmaId/aulas/:aulaId/presencas` | `Bearer` instrutor/coordenador/admin | Lista a presenca dos alunos para uma aula especifica |
| POST | `/turmas/:turmaId/materiais` | `Bearer` instrutor/coordenador/admin | Cadastra material e salva upload opcional |
| DELETE | `/turmas/:turmaId/materiais/:materialId` | `Bearer` instrutor/coordenador/admin | Arquiva (remove da listagem) um material |
| POST | `/turmas/:turmaId/aulas` | `Bearer` instrutor/coordenador/admin | Cadastra uma aula no cronograma da turma |
| DELETE | `/turmas/:turmaId/aulas/:aulaId` | `Bearer` instrutor/coordenador/admin | Remove uma aula sem presenca registrada |
| GET | `/coordenador/dashboard` | `Bearer` coordenador/admin | Dashboard do coordenador |
| GET | `/coordenador/periodo-letivo` | `Bearer` todos os perfis | Consulta o periodo letivo atual |
| PATCH | `/coordenador/periodo-letivo` | `Bearer` coordenador/admin | Atualiza o periodo letivo |
| GET | `/coordenador/certificados` | `Bearer` coordenador/admin | Lista certificados |
| GET | `/coordenador/certificados/:tipo/:referenciaId/pdf` | `Bearer` coordenador/admin | Gera/download PDF do certificado |
| POST | `/coordenador/certificados/alunos` | `Bearer` coordenador/admin | Emite certificado para aluno |
| PATCH | `/coordenador/certificados/:tipo/:id/cancelar` | `Bearer` coordenador/admin | Cancela certificado |
| GET | `/coordenador/relatorios` | `Bearer` coordenador/admin | Lista relatorios disponiveis |
| GET | `/coordenador/relatorios/:tipo/pdf` | `Bearer` coordenador/admin | Exporta relatorio em PDF |
| GET | `/coordenador/relatorios/:tipo/csv` | `Bearer` coordenador/admin | Exporta relatorio em CSV |
| GET | `/coordenador/frequencias` | `Bearer` coordenador/admin | Consolidado de frequencia |
| GET | `/cursos` | `Bearer` coordenador/admin | Lista cursos |
| POST | `/cursos` | `Bearer` coordenador/admin | Cria curso |
| GET | `/instrutores` | `Bearer` coordenador/admin | Lista instrutores |
| POST | `/instrutores` | `Bearer` coordenador/admin | Convida instrutor |
| GET | `/turmas` | `Bearer` coordenador/admin | Lista turmas |
| POST | `/turmas` | `Bearer` coordenador/admin | Cria turma |
| GET | `/turmas/:id` | `Bearer` coordenador/admin | Detalhe da turma |
| GET | `/coordenador/alunos` | `Bearer` coordenador/admin | Lista alunos (visao coordenador) |
| GET | `/coordenador/alunos/:id` | `Bearer` coordenador/admin | Detalhe do aluno |
| PATCH | `/coordenador/alunos/:id` | `Bearer` coordenador/admin | Atualiza aluno via coordenador |
| PATCH | `/coordenador/matriculas/:id` | `Bearer` coordenador/admin | Atualiza status da matricula |
| POST | `/turmas/:turmaId/matriculas` | `Bearer` coordenador/admin | Matricula aluno em turma |
| DELETE | `/turmas/:turmaId/matriculas/:matriculaId` | `Bearer` coordenador/admin | Cancela matricula |
| POST | `/alunos/convites` | `Bearer` coordenador/admin | Convida novo aluno |

## Recuperacao de senha

O endpoint `POST /auth/recuperar-senha`:

- normaliza e valida o e-mail;
- busca o usuario ativo em `usuarios`;
- impede nova solicitacao se ja houve uma nos ultimos 15 minutos;
- gera um token aleatorio;
- salva apenas o `token_hash` em `recuperacoes_senha`;
- por enquanto exibe o link no console.

Ainda nao ha envio real de e-mail. Para producao, adicionar um servico de
envio e manter o token puro fora do banco.

O endpoint `POST /auth/redefinir-senha`:

- recebe o `token` puro (da URL do e-mail) e a `novaSenha`;
- calcula o hash do token e busca em `recuperacoes_senha` um registro
  correspondente, nao usado e nao expirado;
- se nao encontrar, retorna erro generico (link invalido ou expirado);
- atualiza a senha em `usuarios` (e em `alunos`, quando aplicavel) com bcrypt;
- marca o token como usado (`usado_em`), impedindo reuso.

## Exemplos

### POST /auth/login

```json
{
  "identifier": "email_ou_cpf",
  "password": "senha"
}
```

Resposta:

```json
{
  "mensagem": "Login realizado com sucesso!",
  "token": "jwt",
  "usuario": {
    "id": "uuid",
    "nome": "Eduardo Lima",
    "email": "eduardo.lima@example.com",
    "perfil": "instrutor",
    "alunoId": null,
    "instrutorId": "uuid",
    "coordenadorId": null
  }
}
```

### POST /alunos

```json
{
  "nome": "Joao Silva",
  "cpf": "123.456.789-09",
  "telefone": "(83) 99999-9999",
  "email": "joao@email.com",
  "dataNascimento": "2000-01-01",
  "senha": "senhaSegura123",
  "treinamento": "Assistente Administrativo",
  "isAlunoUnipe": true,
  "rgm": "12345678",
  "cursoUnipe": "Administracao"
}
```

### POST /auth/redefinir-senha

```json
{
  "token": "token_recebido_no_link_do_email",
  "novaSenha": "novaSenhaSegura123"
}
```

### PUT /alunos/:id

O CPF nao pode ser alterado. Se a senha for enviada, ela sera salva com bcrypt.

```json
{
  "nome": "Novo Nome",
  "telefone": "(83) 98888-7777",
  "email": "novo@email.com"
}
```
