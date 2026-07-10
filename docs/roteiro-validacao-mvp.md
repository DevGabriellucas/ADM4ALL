# Roteiro de Validacao do MVP - ADM4All

> Versao para apresentacao ao PO/tech lead. Duracao estimada: 30-40 minutos.

## 1. Preparacao do ambiente

- [ ] Docker Desktop ativo.
- [ ] `docker compose up -d --build` executado, banco `healthy`.
- [ ] Backend respondendo em `http://localhost:8000`.
- [ ] Frontend rodando em `http://localhost:3000`.
- [ ] Credenciais de teste conferidas em `docs/seed-casos-teste.md`.
- [ ] `.env` com SMTP configurado para ativacao de conta e recuperacao de senha.

## 2. Fluxos publicos

### Login

- [ ] Tela responsiva em desktop, tablet e celular.
- [ ] Imagem/logo aparece corretamente no mobile.
- [ ] Login invalido mostra erro sem quebrar a tela.
- [ ] Login valido redireciona para a area correta por perfil.

### Cadastro de aluno

- [ ] Lista de treinamentos publicos carrega no select.
- [ ] Treinamento pode ser selecionado no desktop e no mobile.
- [ ] Cadastro valido cria conta pendente de ativacao.
- [ ] E-mail de ativacao e enviado para o aluno cadastrado.

### Recuperar senha

- [ ] Tela responsiva em desktop, tablet e celular.
- [ ] Botao voltar retorna ao login.
- [ ] E-mail valido dispara link de redefinicao.
- [ ] Mensagem de sucesso aparece sem quebrar o layout.

### Redefinir senha

- [ ] Tela usa o mesmo visual da recuperacao de senha.
- [ ] Botao voltar retorna para recuperacao de senha.
- [ ] Link invalido/expirado orienta solicitar novo link.
- [ ] Senha valida e confirmacao igual salvam e retornam ao login.

## 3. Login como coordenador

**Usuario:** `amanda.souza@example.com` / `Coordenador@123`

- [ ] Dashboard carrega com indicadores reais.
- [ ] Periodo letivo exibe valor calculado automaticamente.
- [ ] Clicar no lapis do periodo -> editar -> valor invalido mostra erro.
- [ ] Editar para valor valido, por exemplo `2027.1`, persiste apos reload.
- [ ] Menu mostra as areas reais do MVP: Dashboard, Cursos, Turmas, Alunos,
  Instrutores, Certificados, Relatorios, Usuarios e Configuracoes.
- [ ] Nenhum menu exibe badge "Dev".
- [ ] Nenhum dado mockado aparece no dashboard do coordenador.

### Cursos

- [ ] Lista de cursos carrega.
- [ ] Criar novo curso persiste.

### Turmas

- [ ] Lista de turmas carrega com filtros.
- [ ] Criar nova turma persiste.
- [ ] Abrir detalhe de turma mostra abas de alunos, cronograma, frequencia,
  materiais e certificados.
- [ ] Aba Certificados envia para a tela real de certificados.

### Alunos

- [ ] Lista de alunos carrega com filtros.
- [ ] Abrir detalhe permite editar dados e salvar.
- [ ] Convidar novo aluno persiste como pendente.
- [ ] Alterar status de matricula funciona.
- [ ] Cancelar matricula funciona.

### Instrutores

- [ ] Lista de instrutores carrega.
- [ ] Convidar novo instrutor persiste como pendente.
- [ ] Reenviar ativacao funciona quando o instrutor esta pendente.
- [ ] Ativar/desativar instrutor reflete na listagem.

### Certificados

- [ ] Lista carrega com filtros.
- [ ] Diego Martins aparece como "Emitido" ou "Cancelado", conforme o estado
  atual do banco.
- [ ] Se houver aluno elegivel, botao "Emitir" funciona.
- [ ] Visualizar e baixar PDF funcionam para certificado emitido.
- [ ] Cancelar certificado funciona.

### Relatorios

- [ ] Tipos de relatorio carregam.
- [ ] Filtros por curso, turma e data funcionam.
- [ ] Grafico e tabela atualizam.
- [ ] Gerar PDF abre corretamente.
- [ ] Exportar CSV abre no Excel com acentos corretos.

### Usuarios

- [ ] Lista de usuarios carrega.
- [ ] Filtros por perfil/status funcionam.
- [ ] Convidar coordenador cria usuario pendente.
- [ ] Reenviar ativacao funciona para usuarios pendentes.
- [ ] Ativar/desativar usuario atualiza a tela sem erro.

### Configuracoes

- [ ] Dados da instituicao carregam.
- [ ] Periodo letivo pode ser atualizado.
- [ ] Regra de certificado pode ser atualizada.
- [ ] Preferencias padrao persistem apos reload.

## 4. Login como instrutor

**Usuario:** `eduardo.lima@example.com` / `Instrutor@123`

- [ ] Dashboard carrega com indicadores da turma.
- [ ] Menu mobile/tablet abre pelo icone de hamburguer e fecha corretamente.
- [ ] Cronograma: criar aula persiste.
- [ ] Cronograma: editar aula abre modal/formulario, sem `window.prompt`.
- [ ] Cronograma: cancelar aula envia notificacao aos alunos ativos.
- [ ] Cronograma: remover aula recem-criada.
- [ ] Presenca: registrar presenca/falta para uma aula.
- [ ] Materiais: adicionar material com titulo, tipo e URL/arquivo.
- [ ] Materiais: remover material recem-criado.
- [ ] Perfil: atualizar foto de perfil por upload.
- [ ] Configuracoes nao aparece no menu principal do instrutor; rota direta
  explica que as preferencias do MVP ficam no perfil.

## 5. Login como aluno

### Aluno em andamento

**Usuario:** `priscilla.cahino@example.com` / `Aluno@123`

- [ ] Dashboard mostra progresso, frequencia e status "em andamento".
- [ ] Materiais visiveis da turma aparecem uma unica vez.
- [ ] Download de material funciona.

### Aluno aprovado com certificado

**Usuario:** `diego.martins@example.com` / `Aluno@123`

- [ ] Dashboard mostra status "aprovado" e progresso 100%.
- [ ] Se certificado estiver emitido, botao "Acessar certificado" aparece.
- [ ] Clicar baixa o PDF via endpoint autenticado.
- [ ] Se certificado estiver cancelado, botao nao aparece.

### Aluno reprovado por falta

**Usuario:** `jose.santos@example.com` / `Aluno@123`

- [ ] Dashboard mostra status "reprovado por falta".
- [ ] Alerta de reprovacao visivel.
- [ ] Sem botao de certificado.

## 6. Criterios de aceite

- [ ] Nenhum dado mockado no dashboard do coordenador.
- [ ] Periodo letivo dinamico, nao hardcoded.
- [ ] Cadastro, ativacao, recuperar senha e redefinir senha com e-mail real em
  ambiente configurado.
- [ ] Certificado baixado via endpoint autenticado, nao URL publica.
- [ ] PDF de certificado nao acessivel sem autenticacao.
- [ ] CPF nunca exposto em respostas JSON.
- [ ] Badges de situacao com cores distintas: regular, atencao, risco e
  reprovado.
- [ ] Telas principais responsivas em desktop, tablet e celular.

## 7. Pontos a explicar durante a apresentacao

1. **Usuarios e Configuracoes:** ja sao paginas reais no MVP, nao placeholders.
2. **Cronograma/Processos do coordenador:** ficaram fora do menu do MVP. O
   cronograma operacional fica no instrutor e no detalhe da turma.
3. **Certificado manual:** o coordenador emite manualmente. A automacao depende
   da confirmacao final da regra de elegibilidade pelo PO.
4. **Regra de elegibilidade:** atualmente usa a regra implementada no sistema.
   Caso o PO confirme outra regra, ajustar conforme `docs/decisoes-produto.md`.
5. **Periodo letivo:** calculado automaticamente e editavel pelo coordenador.
6. **Storage privado:** certificados ficam em `storage/certificados/`, nao
   servidos publicamente.
7. **Pendencias pos-MVP:** testes E2E mais amplos, storage externo e operacao
   de SMTP em producao continuam documentados em `docs/pendencias-pos-mvp.md`.
