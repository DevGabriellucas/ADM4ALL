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
| `ADMIN_API_KEY` | Chave simples para proteger rotas administrativas |

## Autorizacao

O login retorna um token JWT simples, assinado com `JWT_SECRET`.
Nas rotas protegidas por perfil, envie:

```http
Authorization: Bearer token_recebido_no_login
```

As rotas administrativas antigas de alunos ainda aceitam provisoriamente:

```http
x-api-key: valor_do_ADMIN_API_KEY
```

## Contrato da API

| Metodo | Endpoint | Protecao | Descricao |
|---|---|---|---|
| POST | `/auth/login` | Publica | Realiza login e retorna token/perfil |
| POST | `/auth/recuperar-senha` | Publica | Solicita recuperacao de senha |
| POST | `/auth/redefinir-senha` | Publica | Redefine a senha a partir do token recebido por e-mail |
| POST | `/alunos` | Publica | Cadastra novo aluno |
| GET | `/alunos` | `x-api-key` | Lista alunos |
| GET | `/alunos/:id` | `x-api-key` | Busca aluno por ID |
| PUT | `/alunos/:id` | `x-api-key` | Atualiza cadastro de aluno |
| DELETE | `/alunos/:id` | `x-api-key` | Remove aluno |
| GET | `/instrutores/:id/dashboard` | `Bearer` instrutor/coordenador/admin | Dashboard do instrutor |
| POST | `/instrutores/:id/avatar` | `Bearer` instrutor/coordenador/admin | Atualiza a foto de perfil do instrutor |
| POST | `/turmas/:turmaId/presencas` | `Bearer` instrutor/coordenador/admin | Registra presencas da turma |
| GET | `/turmas/:turmaId/aulas/:aulaId/presencas` | `Bearer` instrutor/coordenador/admin | Lista a presenca dos alunos para uma aula especifica |
| POST | `/turmas/:turmaId/materiais` | `Bearer` instrutor/coordenador/admin | Cadastra material e salva upload opcional |
| DELETE | `/turmas/:turmaId/materiais/:materialId` | `Bearer` instrutor/coordenador/admin | Arquiva (remove da listagem) um material |
| POST | `/turmas/:turmaId/aulas` | `Bearer` instrutor/coordenador/admin | Cadastra uma aula no cronograma da turma |
| DELETE | `/turmas/:turmaId/aulas/:aulaId` | `Bearer` instrutor/coordenador/admin | Remove uma aula sem presenca registrada |

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
