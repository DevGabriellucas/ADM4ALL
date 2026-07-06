# Roteiro de Validação do MVP — ADM4All

> Versão para apresentação ao PO/tech lead. Duração estimada: 30-40 minutos.

## 1. Preparação do ambiente

- [ ] Docker Desktop ativo.
- [ ] `docker compose up -d --build` executado, banco `healthy`.
- [ ] Backend respondendo em `http://localhost:8000`.
- [ ] Frontend rodando em `http://localhost:3000`.
- [ ] Credenciais de teste conferidas (ver `docs/seed-casos-teste.md`).

## 2. Login como coordenador

**Usuário:** `amanda.souza@example.com` / `Coordenador@123`

- [ ] Dashboard carrega com indicadores reais.
- [ ] Período letivo exibe valor calculado automaticamente.
- [ ] Clicar no lápis do período → editar → valor inválido mostra erro.
- [ ] Editar para valor válido (ex: 2027.1) → persiste após reload.
- [ ] Sidebar mostra todas as áreas, com badge "Dev" em Cronograma, Processos,
  Usuários e Configurações.
- [ ] Alunos em atenção — "Risco de reprovação" em laranja, "Reprovado por
  falta" em vermelho.
- [ ] Relatórios recentes mostra empty state ou dados reais.
- [ ] **Nenhum dado mockado** ("Próximas aulas" e "Processos em andamento"
  removidos).

### Cursos
- [ ] Lista de cursos carrega.
- [ ] Criar novo curso → persiste.

### Turmas
- [ ] Lista de turmas carrega com filtros.
- [ ] Criar nova turma → persiste.
- [ ] Abrir detalhe de turma → abas de alunos e cronograma.

### Alunos
- [ ] Lista de alunos carrega com filtros.
- [ ] Abrir detalhe → editar dados → salvar.
- [ ] Convidar novo aluno → persiste como pendente.
- [ ] Alterar status de matrícula.
- [ ] Cancelar matrícula.

### Instrutores
- [ ] Lista de instrutores carrega.
- [ ] Convidar novo instrutor → persiste como pendente.

### Frequência
- [ ] Consolidado carrega com filtros por curso, turma e situação.
- [ ] Badges seguem o padrão: regular (verde), atenção (âmbar), risco
  (laranja), reprovado (vermelho).

### Certificados
- [ ] Lista carrega com filtros.
- [ ] Diego Martins aparece como "Emitido" ou "Cancelado" (depende do estado
  atual).
- [ ] Se houver aluno elegível, botão "Emitir" funciona.
- [ ] Visualizar e Baixar PDF funcionam para certificado emitido.
- [ ] Cancelar funciona.

### Relatórios
- [ ] Seis tipos de relatório carregam.
- [ ] Filtros (curso, turma, data) funcionam.
- [ ] Gráfico e tabela atualizam.
- [ ] Gerar PDF → arquivo abre corretamente.
- [ ] Exportar CSV → arquivo abre no Excel com acentos corretos.

## 3. Login como instrutor

**Usuário:** `eduardo.lima@example.com` / `Instrutor@123`

- [ ] Dashboard carrega com indicadores da turma.
- [ ] Cronograma: criar aula → persiste.
- [ ] Cronograma: remover aula recém-criada.
- [ ] Presença: registrar presença/falta para uma aula.
- [ ] Materiais: adicionar material com título, tipo e URL.
- [ ] Materiais: remover material recém-criado.
- [ ] Avatar: atualizar foto de perfil.

## 4. Login como aluno

### Aluno em andamento
**Usuário:** `priscilla.cahino@example.com` / `Aluno@123`

- [ ] Dashboard mostra progresso, frequência e status "em andamento".
- [ ] Materiais visíveis da turma aparecem.
- [ ] Download de material funciona.

### Aluno aprovado com certificado
**Usuário:** `diego.martins@example.com` / `Aluno@123`

- [ ] Dashboard mostra status "aprovado" e progresso 100%.
- [ ] Se certificado estiver emitido, botão "Acessar certificado" aparece.
- [ ] Clicar → PDF baixa (não navega para URL pública).
- [ ] Se certificado estiver cancelado, botão não aparece.

### Aluno reprovado por falta
**Usuário:** `jose.santos@example.com` / `Aluno@123`

- [ ] Dashboard mostra status "reprovado por falta".
- [ ] Alerta de reprovação visível.
- [ ] Sem botão de certificado.

## 5. Critérios de aceite

- [ ] Nenhum dado mockado no dashboard do coordenador.
- [ ] Período letivo dinâmico, não hardcoded.
- [ ] Certificado baixado via endpoint autenticado, não URL pública.
- [ ] PDF de certificado não acessível sem autenticação.
- [ ] CPF nunca exposto em respostas JSON.
- [ ] Badge "Dev" visível na sidebar para áreas em desenvolvimento.
- [ ] Páginas em desenvolvimento sem dados mockados.
- [ ] Badges de situação com cores distintas (regular/atenção/risco/reprovado).

## 6. Pontos a explicar durante a apresentação

1. **Áreas com badge "Dev":** Cronograma, Processos, Usuários e Configurações
   estão planejadas para V2. As páginas existem com mensagem honesta, sem
   dados falsos.
2. **Certificado manual:** O coordenador emite manualmente. A automação
   depende da confirmação da regra de elegibilidade pelo PO.
3. **Regra de elegibilidade:** Atualmente faltas < 3. O Documento de Visão
   mencionava frequência >= 80%. Aguardando decisão do PO (ver
   `docs/decisoes-produto.md` DEC-004).
4. **Período letivo:** Calculado automaticamente (corte em 15/07) e editável
   pelo coordenador.
5. **Storage privado:** Certificados em `storage/certificados/`, não servidos
   publicamente.
6. **Pendências pós-MVP:** Ver `docs/pendencias-pos-mvp.md` para a lista
   completa.
