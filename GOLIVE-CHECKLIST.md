# Checklist Go-Live ADM4All — 19/09/2026

## ✅ Limpeza de dados fake (CONCLUÍDO)

- [x] Removidos scripts de dados de teste (`database/seeds/dev/20-21.sql`)
- [x] Arquivada documentação com credenciais de teste
- [x] Atualizada documentação para avisar que dados de teste não devem rodar
- [x] Pasta vazia `database/seeds/dev/` removida
- [x] João Pessoa / PB já corretos no banco

## ✅ DADOS DA INSTITUIÇÃO (preenchidos)

| Config | Valor |
|--------|-------|
| `instituicao_email` | `unipeadm4all@gmail.com` |
| `instituicao_telefone` | `(83) 98871-6106` |
| `instituicao_cidade` / `uf` | João Pessoa / PB |

Aplicado no banco em 08/09/2026.

O script de init usa `ON CONFLICT DO NOTHING`, então ele só grava esses valores
num banco novo. Em banco já existente, é o UPDATE que vale:

```bash
docker compose exec -T db psql -U adm4all -d adm4all -v ON_ERROR_STOP=1 < database/seeds/producao/atualizar-dados-instituicao.sql
```

## ✅ ADMIN INICIAL (aplicado em 08/09/2026)

Conta única de admin, com login validado em `POST /auth/login` (HTTP 200).
Ela substituiu o `admin.ti@adm4all.edu.br` criado na limpeza de 02/09 —
mesmo CPF, e-mail e senha novos.

As credenciais reais **não ficam no repositório**. O Git guarda só o modelo
`criar-admin-inicial.sql`, com placeholders; a cópia preenchida vive em
`criar-admin-inicial.local.sql`, ignorada pelo Git, na máquina do deploy.

```bash
docker compose exec -T db psql -U adm4all -d adm4all -v ON_ERROR_STOP=1 < database/seeds/producao/criar-admin-inicial.local.sql
```

⚠️ O `.local.sql` não vem no `git clone`. Para fazer deploy de outra máquina,
copie-o por um canal seguro — e guarde a senha em outro lugar também, porque
se essa máquina for formatada o arquivo se perde.

⚠️ Trocar a senha no primeiro acesso, pelo fluxo de "Esqueci minha senha".

## 🟡 CONFIGURAÇÕES DO .env (VERIFICAR)

Antes do deploy:

```bash
# backend/.env
EXPOSE_ACTIVATION_LINK=false  # ← DEVE SER FALSE em produção
FRONTEND_URL=<URL real>
GMAIL_USER=<conta de envio real>
GMAIL_APP_PASSWORD=<senha de app do Gmail>

# frontend/.env
NEXT_PUBLIC_API_URL=<URL da API em produção>
```

## ✅ BANCO DE PRODUÇÃO

- [x] Limpo (sem usuários fake)
- [x] Perfis criados (aluno, instrutor, coordenador, admin)
- [x] 5 cursos padrão inseridos
- [x] Configurações básicas inseridas

## 📋 ANTES DO AR

1. [x] Email e telefone do UNIPE confirmados
2. [x] Dados da instituição e conta de admin aplicados no banco
3. [ ] `.env` de produção configurado
4. [ ] Turmas e instrutores cadastrados
5. [ ] Teste de fluxo completo (cadastro → ativação → login → relatório)
6. [ ] Teste de envio de e-mail
7. [ ] Backup do banco antes do go-live
8. [ ] Comunicado aos alunos sobre disponibilidade

---

**Últimas modificações:** 08/09/2026
**Go-live:** 19/09/2026 (11 dias)
