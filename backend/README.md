## Tecnologias
- **Node.js** (CommonJS)
- **TypeScript**
- **Express**
- **PostgreSQL**
- **Bcrypt** (hash de senhas)
- **Nodemailer** (envio de e-mails)

## Como rodar
1. Certifique-se de ter um arquivo `.env` com as configurações de banco de dados e e-mail.
2. Instale as dependências: `npm install`
3. Rode em modo de desenvolvimento: `npm run start:dev`

## Contrato da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| POST | `/auth/login` | Realiza login do aluno |
| POST | `/alunos` | Cadastra um novo aluno |
| POST | `/auth/recuperar-senha` | Solicita recuperação de senha |
| GET | `/alunos` | Lista todos os alunos |
| GET | `/alunos/:id` | Busca aluno por ID |
| PUT | `/alunos/:id` | Atualiza cadastro de um aluno |
| DELETE | `/alunos/:id` | Remove um aluno |

---

## Detalhes das Requisições e Respostas

### 1. POST /auth/login
**Payload:**
```json
{
  "identifier": "seu_email_ou_cpf",
  "password": "sua_senha"
}
```
**Sucesso (200 OK):**
```json
{
  "mensagem": "Login realizado com sucesso!",
  "aluno": { /* Objeto do aluno */ }
}
```
**Erro (401 Unauthorized):**
```json
{ "erro": "Credenciais inválidas." }
```

### 2. POST /alunos
**Payload:**
```json
{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "telefone": "(11) 99999-9999",
  "email": "joao@email.com",
  "dataNascimento": "2000-01-01",
  "senha": "senhaSegura123",
  "treinamento": "algum_treinamento",
  "isAlunoUnipe": true,
  "rgm": "12345678",
  "cursoUnipe": "Ciência da Computação"
}
```
**Sucesso (201 Created):**
```json
{ "id": "uuid", "nome": "João Silva", "mensagem": "Aluno cadastrado com sucesso!" }
```
**Erro (400 Bad Request):**
```json
{ "erro": "Mensagem de erro específica" }
```

### 3. POST /auth/recuperar-senha
**Payload:**
```json
{
  "email": "joao@email.com"
}
```
**Sucesso (200 OK):**
```json
{ "mensagem": "Se o e-mail estiver cadastrado, as instruções foram enviadas." }
```
**Erro (400 Bad Request):**
```json
{ "erro": "O e-mail é obrigatório." }
```

### 4. GET /alunos/:id
**Parâmetros:** `id` (UUID do aluno)
**Sucesso (200 OK):**
```json
{ /* Objeto do aluno */ }
```
**Erro (400 Bad Request):**
```json
{ "erro": "O ID do aluno fornecido é inválido." }
```

### 5. PUT /alunos/:id
**Parâmetros:** `id` (UUID do aluno)
**Payload:** (Campos do aluno para atualização)
```json
{
  "nome": "Novo Nome",
  "telefone": "(11) 99999-9999"
}
```
**Sucesso (200 OK):**
```json
{ "id": "uuid", "nome": "Novo Nome", "mensagem": "Cadastro atualizado!" }
```
**Erro (400 Bad Request):**
```json
{ "erro": "O ID do aluno fornecido é inválido" }
```

### 6. DELETE /alunos/:id
**Parâmetros:** `id` (UUID do aluno)
**Sucesso (200 OK):**
```json
{ "mensagem": "Aluno removido com sucesso." }
```
**Erro (400 Bad Request):**
```json
{ "erro": "O ID do aluno fornecido é inválido." }
```