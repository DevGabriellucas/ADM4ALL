# ADM4All - Checklist de Prontidao para Deploy

Status preparado em 08/07/2026 para deploy previsto em 10/07/2026.
Smoke test manual de cadastro, e-mail, ativacao e login confirmado em 08/07/2026.
Build Docker validado em 08/07/2026 com `docker compose --env-file .env.example build`.

## Envio e acesso

- [ ] Adicionar o responsavel DevOps ao GitLab com permissao para clonar a branch de deploy.
- [x] Branch indicada para deploy: `develop`.
- [x] Checklist anexado ao repositorio como `README_DEPLOY.md`.
- [ ] Notificar o DevOps apos preencher as variaveis reais de ambiente.

## Seguranca e integridade do codigo

- [x] Credenciais reais nao devem ser versionadas. Use apenas `.env` local/servidor.
- [x] `.env`, `.env.local` e `.env.*.local` estao no `.gitignore`.
- [x] URLs publicas de frontend/backend devem vir de variaveis de ambiente.
- [x] `JWT_SECRET`, `ADMIN_API_KEY` e senha de e-mail devem ser trocados em producao.
- [ ] Revisar logs operacionais antes do deploy final. Logs de erro essenciais podem permanecer.

## Ambiente e dependencias

Runtime esperado:

| Camada | Versao |
|---|---|
| Node.js | 20 |
| Frontend | Next.js 16, React 19 |
| Backend | Express 5, TypeScript |
| Banco | PostgreSQL 16 |

Arquivos de dependencias:

- `frontend/package.json`
- `frontend/package-lock.json`
- `backend/package.json`
- `backend/package-lock.json`

Variaveis obrigatorias no `.env` de deploy:

```env
POSTGRES_USER=adm4all
POSTGRES_PASSWORD=troque_esta_senha
POSTGRES_DB=adm4all
POSTGRES_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=3000
DATABASE_URL=postgresql://adm4all:troque_esta_senha@db:5432/adm4all
FRONTEND_URL=https://app.seu-dominio.edu.br
NEXT_PUBLIC_API_URL=https://api.seu-dominio.edu.br
JWT_SECRET=troque_por_um_segredo_com_32_ou_mais_caracteres
ADMIN_API_KEY=troque_por_uma_chave_administrativa_segura
GMAIL_USER=conta-de-envio@seu-dominio.edu.br
GMAIL_APP_PASSWORD=troque_pela_senha_de_app
EMAIL_TLS_REJECT_UNAUTHORIZED=true
EXPOSE_ACTIVATION_LINK=false
```

## Build e execucao

Docker:

```bash
cp .env.example .env
docker compose up -d --build
```

Validacao realizada:

```bash
docker compose --env-file .env.example build
```

Resultado: imagens `adm4all-backend` e `adm4all-frontend` geradas com sucesso.

Adminer nao sobe por padrao. Para uso temporario em ambiente fechado:

```bash
docker compose --profile tools up -d adminer
```

Build manual:

```bash
cd backend
npm ci
npm run build

cd ../frontend
npm ci
npm run build
```

## Banco de dados e migracoes

O banco novo e criado pelos scripts em `database/init`.

Se o ambiente ja tiver banco/volume existente, rode antes do deploy:

```powershell
Get-Content .\database\migrations\20260708_turma_instrutores.sql | docker compose exec -T db psql -U adm4all -d adm4all
```

Persistencia necessaria:

- Volume Docker `pgdata` para PostgreSQL.
- Pasta `backend/uploads` para materiais enviados.
- Pasta `backend/storage` para certificados PDF gerados.

## Smoke test pos-deploy

1. [x] Acessar `FRONTEND_URL`.
2. [x] Fazer login como coordenador/admin.
3. [x] Abrir dashboard do coordenador.
4. [ ] Abrir `Cursos` e validar visualizar/editar/desativar curso.
5. [ ] Abrir `Turmas` e validar turma com um ou mais instrutores.
6. [ ] Abrir `Alunos`, editar aluno e vincular a turma.
7. [ ] Abrir `Instrutores`, visualizar, editar, desativar/reativar e reenviar ativacao quando pendente.
8. [x] Fazer cadastro publico de aluno.
9. [x] Confirmar recebimento do e-mail de ativacao.
10. [x] Abrir link de ativacao e fazer login como aluno.
11. [ ] Validar que aluno ve apenas material visivel.
12. [x] Fazer login como instrutor.
13. [ ] Validar cronograma, presenca e materiais.
14. [ ] Cancelar aula e confirmar notificacao por e-mail aos alunos matriculados.

## Endpoints criticos

- `GET /health`
- `POST /login`
- `POST /alunos`
- `GET /coordenador/dashboard`
- `GET /cursos`
- `GET /turmas`
- `GET /instrutores`
- `GET /alunos`
- `GET /instrutores/:id/dashboard`
- `GET /alunos/:id/dashboard`

## Pendencias externas antes de liberar

- Definir dominio publico do frontend.
- Definir dominio publico da API.
- Preencher `.env` real no servidor.
- Garantir senha de app do Gmail ou SMTP institucional.
- Rodar a migracao se o banco ja existir.
- Adicionar DevOps ao GitLab e avisar que a branch `develop` esta pronta.
