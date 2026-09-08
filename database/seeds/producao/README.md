# Primeiro acesso em produção

Os scripts de `database/init/` criam **apenas a estrutura**: tabelas, perfis
(aluno, instrutor, coordenador, admin) e as configurações padrão do sistema.
Nenhum usuário é criado automaticamente — de propósito, para o banco de produção
não nascer com conta de senha conhecida.

Por isso, num banco novo é preciso criar a primeira conta manualmente. Sem ela
ninguém entra no sistema: coordenadores e instrutores são cadastrados de dentro,
por alguém já autenticado, e o cadastro público só cria aluno.

## Criando o administrador inicial

O script pede um hash de senha, não a senha em texto. Gere o hash primeiro:

```bash
cd backend
node -e "console.log(require('bcrypt').hashSync('SUA_SENHA_AQUI', 10))"
```

Depois edite `criar-admin-inicial.sql` preenchendo nome, e-mail, CPF e o hash
gerado, e rode:

```bash
docker compose exec -T db psql -U adm4all -d adm4all < database/seeds/producao/criar-admin-inicial.sql
```

Confira que a conta entrou:

```bash
docker compose exec -T db psql -U adm4all -d adm4all \
  -c "SELECT u.nome, u.email, p.nome AS perfil, u.status
        FROM usuarios u JOIN perfis p ON p.id = u.perfil_id;"
```

## Pontos de atenção

- **O CPF precisa ser válido**: o sistema confere o dígito verificador. Um CPF
  inventado é recusado se alguém tentar editar o cadastro pela interface.
- **O e-mail precisa ser real e acessível**: é por ele que passa a recuperação de
  senha. Um endereço fictício deixa a conta sem como recuperar o acesso.
- **Troque a senha no primeiro acesso**, pelo fluxo de "Esqueci minha senha".
- **Cadastre os cursos antes de abrir as inscrições**: o formulário de cadastro
  público exige escolher um treinamento. Sem curso cadastrado a lista fica vazia
  e o aluno não consegue concluir a inscrição.

## Dados de teste foram removidos

Os scripts de teste (`database/seeds/dev/20-21.sql`) foram removidos do repositório antes do go-live.

**NUNCA rode dados de teste em produção.** O banco de produção foi limpo propositalmente e não deve ser populado com credenciais conhecidas.
