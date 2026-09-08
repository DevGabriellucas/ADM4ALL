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

⚠️ **Falta aplicar no banco que já existe.** O script de init usa
`ON CONFLICT DO NOTHING`, então ele só grava esses valores num banco novo.
Com o Docker rodando:

```bash
docker compose exec -T db psql -U adm4all -d adm4all < database/seeds/producao/atualizar-dados-instituicao.sql
```

Depois confirme em Coordenador > Configurações.

## ✅ ADMIN INICIAL (preenchido)

`database/seeds/producao/criar-admin-inicial.sql` já está com nome, e-mail,
CPF e o hash bcrypt da senha. Para criar a conta no banco:

```bash
docker compose exec -T db psql -U adm4all -d adm4all < database/seeds/producao/criar-admin-inicial.sql
```

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
2. [ ] Rodar `atualizar-dados-instituicao.sql` e `criar-admin-inicial.sql` no banco
3. [ ] `.env` de produção configurado
4. [ ] Turmas e instrutores cadastrados
5. [ ] Teste de fluxo completo (cadastro → ativação → login → relatório)
6. [ ] Teste de envio de e-mail
7. [ ] Backup do banco antes do go-live
8. [ ] Comunicado aos alunos sobre disponibilidade

---

**Últimas modificações:** 08/09/2026
**Go-live:** 19/09/2026 (11 dias)
