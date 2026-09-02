# Roteiro de Apresentacao para Cliente - ADM4All

> **Atenção — estas credenciais não existem mais por padrão.**
> O banco de produção foi limpo e os dados de teste saíram de
> `database/init/`. Para usar este roteiro, popule um ambiente de
> desenvolvimento primeiro:
>
> ```bash
> docker compose exec -T db psql -U adm4all -d adm4all < database/seeds/dev/20-inserir-dados-teste.sql
> docker compose exec -T db psql -U adm4all -d adm4all < database/seeds/dev/21-inserir-casos-demo-mvp.sql
> ```


> Roteiro pensado para uma apresentacao simples, para cliente sem conhecimento
> tecnico. Duracao sugerida: 25 a 35 minutos.

## 1. Antes da reuniao

- Abrir o sistema em `http://localhost:3000`.
- Deixar o Docker rodando.
- Conferir se backend, frontend e banco estao ativos.
- Separar as credenciais:
  - Coordenador: `amanda.souza@example.com` / `Coordenador@123`
  - Instrutor: `eduardo.lima@example.com` / `Instrutor@123`
  - Aluno em andamento: `priscilla.cahino@example.com` / `Aluno@123`
  - Aluno aprovado: `diego.martins@example.com` / `Aluno@123`
- Se for testar e-mail real, lembrar que pode cair em spam no MVP.

## 2. Abertura - 2 minutos

Fala sugerida:

"Hoje eu vou apresentar o ADM4All, que e uma plataforma criada para organizar a
gestao de cursos, turmas, alunos, instrutores, frequencias, materiais e
certificados. A ideia principal e tirar esses controles de planilhas soltas e
colocar tudo em um unico sistema, com cada pessoa acessando apenas a area que
faz sentido para ela."

Continue:

"A demonstracao vai ser por perfil. Primeiro vou mostrar a entrada do sistema,
depois a area do coordenador, depois a area do instrutor e por fim a area do
aluno."

## 3. Tela inicial, cadastro e recuperacao de senha - 5 minutos

### Login

O que mostrar:

- Tela inicial do sistema.
- Campos de e-mail/CPF e senha.
- Link de recuperar senha.
- Link de cadastro.

Fala sugerida:

"Aqui e a porta de entrada do sistema. O usuario pode entrar usando e-mail ou
CPF. O sistema identifica automaticamente o perfil da pessoa e leva para a area
correta: aluno, instrutor ou coordenador."

### Cadastro de aluno

O que mostrar:

- Clicar em `Cadastre-se`.
- Mostrar os campos principais.
- Mostrar o select de treinamento.

Fala sugerida:

"No cadastro, o aluno informa seus dados e escolhe o treinamento disponivel.
Depois disso, a conta fica pendente de ativacao e o sistema envia um e-mail para
confirmar o acesso."

Observacao simples:

"No ambiente de teste estamos usando Gmail, entao o e-mail pode cair em spam.
Em producao, o ideal e usar um e-mail oficial com dominio da instituicao."

### Recuperar senha

O que mostrar:

- Clicar em `Recuperar Senha`.
- Mostrar tela de envio de e-mail.
- Explicar a redefinicao.

Fala sugerida:

"Se a pessoa esquecer a senha, ela informa o e-mail cadastrado e recebe um link
para criar uma nova senha. Isso evita que alguem precise alterar senha
manualmente."

## 4. Area do coordenador - 10 a 15 minutos

Entrar com:

`amanda.souza@example.com` / `Coordenador@123`

Fala de entrada:

"A area do coordenador e a area administrativa. E onde a gestao acompanha o
andamento geral do projeto."

### Dashboard

O que mostrar:

- Indicadores principais.
- Resumo de alunos, turmas, certificados e andamento.

Fala sugerida:

"Aqui o coordenador tem uma visao geral. Ele consegue entender rapidamente como
esta o projeto: turmas em andamento, alunos, certificados e situacoes que
precisam de atencao."

### Cursos

O que mostrar:

- Lista de cursos.
- Possibilidade de criar curso.

Fala sugerida:

"Em cursos, a coordenacao cadastra os treinamentos ofertados. Esses cursos
depois aparecem para formar turmas e tambem no cadastro publico do aluno."

### Turmas

O que mostrar:

- Lista de turmas.
- Detalhe de uma turma.
- Abas de alunos, cronograma, frequencia, materiais e certificados.

Fala sugerida:

"A turma junta o curso, periodo, capacidade, instrutores e alunos. Dentro do
detalhe da turma, a coordenacao acompanha tudo que acontece naquela turma."

### Alunos

O que mostrar:

- Lista de alunos.
- Filtros/status.
- Detalhe de um aluno.
- Reenvio de ativacao, se houver aluno pendente.

Fala sugerida:

"Aqui ficam os alunos cadastrados. O coordenador consegue consultar dados,
acompanhar matricula, status da conta e reenviar ativacao quando necessario."

### Instrutores

O que mostrar:

- Lista de instrutores.
- Convite de ativacao.
- Status ativo/pendente/inativo.

Fala sugerida:

"A area de instrutores permite gerenciar quem ministra as turmas. O instrutor
pode ser convidado por e-mail e depois acessa a propria area do sistema."

### Certificados

O que mostrar:

- Lista de certificados.
- Botao de emitir, visualizar ou baixar quando disponivel.

Fala sugerida:

"A emissao de certificado hoje e controlada pela coordenacao. O sistema ajuda a
ver quem esta apto, permite emitir, baixar e cancelar certificados quando
necessario."

### Relatorios

O que mostrar:

- Tela de relatorios.
- Filtros.
- Geracao de PDF/CSV.

Fala sugerida:

"A parte de relatorios transforma os dados do sistema em informacoes para
acompanhamento e prestacao de contas. A coordenacao pode filtrar e exportar os
dados."

### Usuarios e configuracoes

O que mostrar:

- Usuarios.
- Configuracoes da instituicao, periodo letivo e regras.

Fala sugerida:

"Usuarios e configuracoes servem para manter o sistema administravel. Aqui
ficam dados institucionais, periodo letivo, regras de certificado e preferencias
gerais."

## 5. Area do instrutor - 7 a 10 minutos

Entrar com:

`eduardo.lima@example.com` / `Instrutor@123`

Fala de entrada:

"Agora vou mostrar a area do instrutor, que e mais operacional. O foco dele e
acompanhar aulas, presencas e materiais da turma."

### Dashboard do instrutor

O que mostrar:

- Indicadores da turma.
- Resumo do que ele precisa acompanhar.

Fala sugerida:

"O instrutor entra e ja ve um resumo das turmas e atividades relacionadas a ele."

### Cronograma

O que mostrar:

- Lista de aulas.
- Criar aula.
- Editar aula.
- Cancelar aula.

Fala sugerida:

"No cronograma, o instrutor organiza as aulas. Ele pode cadastrar, editar,
marcar como realizada ou cancelar uma aula. Quando uma aula e cancelada, o
sistema tambem pode avisar os alunos por e-mail."

### Presenca

O que mostrar:

- Lancamento de presenca/falta.

Fala sugerida:

"Na presenca, o instrutor registra quem participou da aula. Esses dados depois
alimentam o acompanhamento do aluno e ajudam na regra de certificado."

### Materiais

O que mostrar:

- Lista de materiais.
- Criar/adicionar material.
- Visibilidade para aluno.

Fala sugerida:

"Em materiais, o instrutor disponibiliza conteudos para os alunos. O sistema
controla o que fica visivel para a turma."

### Perfil

O que mostrar:

- Dados do instrutor.
- Foto de perfil.

Fala sugerida:

"No perfil, o instrutor consegue visualizar seus dados e atualizar a foto."

## 6. Area do aluno - 5 a 7 minutos

Entrar com:

`priscilla.cahino@example.com` / `Aluno@123`

Fala de entrada:

"Por fim, a area do aluno e mais simples. Ela foi pensada para ele acompanhar o
proprio progresso sem precisar entender a parte administrativa."

### Dashboard do aluno

O que mostrar:

- Progresso.
- Frequencia.
- Status do curso.

Fala sugerida:

"O aluno acompanha o andamento dele no curso: progresso, frequencia e situacao.
Isso deixa mais claro se ele esta regular, em atencao ou em risco."

### Materiais

O que mostrar:

- Lista de materiais disponiveis.
- Download/acesso quando houver arquivo.

Fala sugerida:

"Aqui o aluno acessa os materiais disponibilizados pelo instrutor para a turma."

### Certificado

Se usar o aluno aprovado:

`diego.martins@example.com` / `Aluno@123`

Fala sugerida:

"Quando o aluno conclui o curso e o certificado e emitido pela coordenacao, ele
consegue acessar o certificado pela propria area."

## 7. Mostrar responsividade - 2 minutos

O que mostrar:

- Diminuir a tela no navegador ou usar modo responsivo.
- Mostrar login.
- Mostrar menu do instrutor/coordenador em tela menor.

Fala sugerida:

"O sistema tambem foi ajustado para funcionar em computador, tablet e celular.
Isso e importante porque nem sempre o aluno ou instrutor vai acessar de um
computador."

## 8. Fechamento - 3 minutos

Fala sugerida:

"Entao, resumindo: o ADM4All ja cobre os principais fluxos do MVP. O aluno se
cadastra, ativa a conta, acompanha materiais e progresso. O instrutor gerencia
aulas, presencas e materiais. O coordenador acompanha cursos, turmas, alunos,
instrutores, certificados, relatorios e configuracoes."

Continue:

"Para uma proxima etapa, os pontos mais importantes seriam colocar o envio de
e-mail em um dominio oficial da instituicao, ampliar testes automaticos,
melhorar rotinas de backup e evoluir algumas automacoes, como emissao automatica
ou em lote de certificados."

Pergunta final para a cliente:

"Com base no que foi apresentado, esse fluxo atende a rotina de voces? Tem
alguma regra de negocio que precisa ser ajustada antes de considerar o MVP
validado?"

## 9. Perguntas provaveis e respostas simples

### "O sistema ja esta pronto para producao?"

Resposta:

"Ele esta pronto como MVP funcional para validacao. Para producao final, ainda
recomendo usar e-mail oficial da instituicao, dominio autenticado, backup dos
arquivos e mais testes automatizados."

### "Por que o e-mail caiu no spam?"

Resposta:

"No ambiente de teste estamos usando Gmail. Para producao, o ideal e usar um
e-mail oficial com dominio autenticado, porque isso melhora a confianca e reduz
a chance de cair em spam."

### "O certificado e automatico?"

Resposta:

"Neste MVP a emissao e feita pela coordenacao, com controle manual. A emissao
automatica pode entrar numa proxima etapa, depois que a regra final de
elegibilidade for confirmada."

### "Da para usar pelo celular?"

Resposta:

"Sim. As principais telas foram ajustadas para computador, tablet e celular."

### "Cada perfil ve coisas diferentes?"

Resposta:

"Sim. Aluno, instrutor e coordenador possuem areas diferentes, com funcoes
adequadas para cada papel."

## 10. Frases para evitar na reuniao

- Evitar: "backend", "frontend", "API", "commit", "Docker", "banco de dados".
- Preferir: "sistema", "area do aluno", "area do instrutor", "area da
  coordenacao", "dados salvos", "envio de e-mail", "relatorio".

## 11. Ordem curta caso tenha pouco tempo

Se a apresentacao precisar ser mais rapida, mostrar nesta ordem:

1. Login e cadastro.
2. Coordenador: dashboard, turmas, alunos, certificados e relatorios.
3. Instrutor: cronograma, presenca e materiais.
4. Aluno: progresso, materiais e certificado.
5. Fechamento com proximos passos.
