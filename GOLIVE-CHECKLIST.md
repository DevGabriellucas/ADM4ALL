# Checklist Go-Live ADM4All — 19/09/2026

## ✅ Limpeza de dados fake (CONCLUÍDO)

- [x] Removidos scripts de dados de teste (`database/seeds/dev/20-21.sql`)
- [x] Arquivada documentação com credenciais de teste
- [x] Atualizada documentação para avisar que dados de teste não devem rodar
- [x] Pasta vazia `database/seeds/dev/` removida
- [x] João Pessoa / PB já corretos no banco

## 🔴 DADOS REAIS DO UNIPE (FALTAM)

Estes dados ainda são placeholder e precisam ser atualizados em `database/init/13-inserir-configuracoes-padrao.sql`:

| Config | Valor atual (placeholder) | Valor real |
|--------|---------------------------|-----------|
| `instituicao_email` | `contato@adm4all.edu.br` | ??? |
| `instituicao_telefone` | `(11) 3000-0000` | ??? |

**Como atualizar:**

1. Forneça o email e telefone reais do UNIPE
2. Atualize `database/init/13-inserir-configuracoes-padrao.sql` (linhas 5-6)
3. Resete o banco: `docker compose down -v && docker compose up -d`
4. Confirme em Coordenador > Configurações

## 🔴 CREDENCIAIS DO ADMIN INICIAL (FALTAM)

Em `database/seeds/producao/criar-admin-inicial.sql`, substitua:

- `admin.ti@adm4all.edu.br` → email real do admin de TI
- `529.982.247-25` → CPF real (válido, com dígito verificador)
- Hash de senha (gerado via `bcrypt.hashSync()`)

**Instruções no arquivo:** `database/seeds/producao/README.md`

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

1. [ ] Email e telefone do UNIPE confirmados
2. [ ] Admin inicial criado com credenciais reais
3. [ ] `.env` de produção configurado
4. [ ] Turmas e instrutores cadastrados
5. [ ] Teste de fluxo completo (cadastro → ativação → login → relatório)
6. [ ] Teste de envio de e-mail
7. [ ] Backup do banco antes do go-live
8. [ ] Comunicado aos alunos sobre disponibilidade

---

**Últimas modificações:** 08/09/2026
**Go-live:** 19/09/2026 (11 dias)
