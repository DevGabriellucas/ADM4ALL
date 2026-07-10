# Guia de testes do ADM4All para apresentação ao tech lead

> Escopo: principais funcionalidades implementadas, incluindo a rota de relatórios do coordenador.
>
> Atualizado em: 06/07/2026.

## 1. Visão rápida do que está pronto

O projeto possui frontend em Next.js, API em Node.js/Express, autenticação JWT e persistência em PostgreSQL. Os principais fluxos integrados são:

- cadastro público e ativação de conta;
- login por e-mail ou CPF, com redirecionamento por perfil;
- recuperação e redefinição de senha;
- dashboard do aluno com diferentes situações de matrícula;
- dashboard do instrutor com presença, cronograma, materiais e avatar;
- dashboard do coordenador com indicadores reais (sem dados mockados);
- período letivo dinâmico/editável;
- gestão de cursos, turmas, alunos, matrículas e instrutores;
- consulta consolidada de frequência;
- emissão, visualização, download e cancelamento de certificados;
- download autenticado de certificado pelo aluno (storage privado);
- materiais visíveis ao aluno com download autenticado;
- relatórios acadêmicos com filtros, prévia gráfica e exportação em PDF e CSV;
- controle de acesso por perfil e encerramento da sessão.

As áreas de Cronograma, Processos, Usuários e Configurações estão visíveis na
sidebar do coordenador com badge "Dev" e exibem mensagem honesta de
funcionalidade em desenvolvimento, sem dados mockados.

## 2. Preparação antes da demonstração

### Requisitos

- Docker Desktop em execução;
- Node.js e npm instalados;
- portas `3000`, `8000`, `5432` e `8080` disponíveis;
- arquivos `backend/.env` e `frontend/.env` configurados.

O `frontend/.env` deve conter:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
INSTRUTOR_ID=9ab264bc-036b-4e62-ba6b-6a93d2da94c2
```

Para testar envio real de e-mail, o `backend/.env` também precisa de credenciais SMTP válidas:

```env
GMAIL_USER=conta_de_envio
GMAIL_APP_PASSWORD=senha_de_aplicativo
FRONTEND_URL=http://localhost:3000
```

### Subir banco, backend e Adminer

Na raiz do projeto:

```powershell
docker compose up -d --build
docker compose ps
```

Resultados esperados:

- `adm4all_db`: `healthy`;
- `adm4all_backend`: `Up`;
- `adm4all_adminer`: `Up`;
- API disponível em `http://localhost:8000`;
- Adminer disponível em `http://localhost:8080`.

### Subir o frontend

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`.

### Atenção ao banco de demonstração

Os scripts de `database/init` só são executados quando o volume do PostgreSQL é criado. Se os dados de teste estiverem alterados e for indispensável começar do zero:

```powershell
docker compose down -v
docker compose up -d --build
```

Esse comando apaga todo o banco local. Use-o somente depois de confirmar que não há dados que precisem ser preservados.

## 3. Credenciais prontas para teste

| Perfil/cenário | Identificador | Senha | Resultado esperado |
|---|---|---|---|
| Aluno em andamento | `priscilla.cahino@example.com` ou `12345678909` | `Aluno@123` | Progresso de 60%, presença e aulas pendentes |
| Aluno aprovado | `diego.martins@example.com` ou `98765432100` | `Aluno@123` | Curso concluído e certificado disponível |
| Aluno reprovado por falta | `jose.santos@example.com` ou `52998224725` | `Aluno@123` | Alerta de reprovação por falta |
| Instrutor | `eduardo.lima@example.com` ou `24681357928` | `Instrutor@123` | Dashboard da turma | 
| Instrutor | `instrutor.contabil@example.com` | `Instrutor@123` | Area de contabil
| Instrutor | `instrutor.rh@example.com` | `Instrutor@123` | Area de RH
| Coordenador | `amanda.souza@example.com` ou `13579246828` | `Coordenador@123` | Área de gestão |
| Administrador | `admin.ti@example.com` ou `86420975310` | `Admin@123` | Área do coordenador com perfil administrativo |

Antes da apresentação, faça ao menos um login de cada perfil. Também teste uma senha incorreta para confirmar a resposta controlada de credencial inválida.

## 4. Roteiro recomendado de apresentação

Este roteiro cabe em aproximadamente 30 a 40 minutos e prioriza os fluxos mais sólidos.

### Etapa 1 — Login, sessão e autorização

1. Abra `http://localhost:3000`.
2. Mostre a validação de campos tentando enviar o formulário vazio.
3. Informe uma credencial inválida e confirme a mensagem de erro.
4. Entre como aluno, instrutor e coordenador em momentos diferentes.
5. Em cada login, destaque o redirecionamento automático para a área correta.
6. Clique em **Sair** e confirme o retorno ao login.
7. Após sair, tente consultar uma ação protegida e mostre que a API rejeita a chamada.

Resultado esperado:

- a API retorna JWT no login;
- a sessão é armazenada em cookie;
- cada perfil é direcionado à sua própria área;
- o dashboard do aluno sem sessão redireciona para o login;
- a API rejeita token ausente, inválido ou de perfil inadequado;
- credencial inválida retorna erro sem expor detalhes internos.

Não afirme que todas as páginas do frontend possuem guarda de rota completa. O instrutor ainda pode exibir o fallback local sem sessão, e as páginas do coordenador normalmente exibem erro de sessão ao tentar buscar a API. Uniformizar esses redirecionamentos é uma pendência.

### Etapa 2 — Experiência do aluno

Faça três logins para mostrar que o painel vem do banco e muda conforme a matrícula.

#### Cenário A: curso em andamento

1. Entre como `priscilla.cahino@example.com`.
2. Confira nome, curso e status da matrícula.
3. Mostre progresso, frequência/faltas e quantidade de aulas.
4. Destaque que os indicadores são calculados a partir de matrícula, aulas e frequências do PostgreSQL.

#### Cenário B: aluno aprovado

1. Saia e entre como `diego.martins@example.com`.
2. Confira o status de aprovação e 100% de progresso.
3. Mostre a mensagem de conclusão.
4. Mostre que o painel identifica o certificado como disponível.
5. Clique em **Acessar certificado** e mostre que o PDF é baixado via
   endpoint autenticado (`GET /alunos/me/certificado/pdf`), sem expor URL
   pública.

#### Cenário C: reprovação por falta

1. Saia e entre como `jose.santos@example.com`.
2. Mostre o status `reprovado por falta`.
3. Confira o alerta específico exibido pela interface.

Resultado esperado: os três usuários exibem estados diferentes com base nos dados persistidos, sem trocar mock no frontend.

### Etapa 3 — Dashboard do instrutor

1. Entre como `eduardo.lima@example.com`.
2. Confira os indicadores de alunos, presentes, frequência média e próxima aula.
3. Mostre a lista de presença, os materiais e o cronograma da turma.

#### Registrar presença

1. No painel de presença, selecione uma aula.
2. Pesquise um aluno pelo nome.
3. Marque presença ou falta.
4. Salve.
5. Atualize a página e confirme que o registro permaneceu.

Use preferencialmente uma aula planejada ou anote os valores anteriores para não prejudicar a massa de demonstração.

#### Gerenciar cronograma

1. Clique para adicionar uma aula.
2. Preencha título, data e horários válidos.
3. Salve e confirme a nova aula na lista.
4. Remova a aula recém-criada para provar o ciclo completo.

Não tente remover uma aula que já possua presença registrada; essa proteção é intencional.

#### Gerenciar materiais

1. Adicione um material com título, tipo e URL.
2. Confirme que ele aparece na lista.
3. Atualize a página para confirmar a persistência.
4. Remova o mesmo material.

O backend também aceita arquivo em base64 e salva uploads, mas para uma demo curta a URL é mais previsível.

#### Atualizar avatar

1. Clique no ícone sobre a foto/iniciais.
2. Selecione uma imagem JPEG, PNG ou WebP de até 5 MB.
3. Confirme a atualização.
4. Recarregue a página para mostrar que o caminho foi persistido.

Observação: o dashboard do instrutor possui fallback para mock quando não há sessão ou quando a API falha. Durante a apresentação, confirme primeiro que o login foi realizado e que o backend está ativo, para garantir que os dados mostrados são os reais.

### Etapa 4 — Dashboard do coordenador

1. Entre como `amanda.souza@example.com`.
2. Mostre os totais consolidados (alunos, turmas ativas, frequência, certificados).
3. Mostre os alunos que exigem atenção (badges coloridas).
4. Mostre o período letivo dinâmico e o botão de edição (lápis).
5. Destaque que a sidebar tem áreas em desenvolvimento com badge "Dev".
6. Explique que os cards são agregações da API sobre o PostgreSQL, sem dados mockados.

### Etapa 5 — Cursos

1. Abra **Cursos**.
2. Confira a lista e os contadores de turmas.
3. Clique em **Novo curso**.
4. Cadastre um curso com nome inédito, descrição, carga horária e status.
5. Confirme que o curso aparece após salvar/recarregar.

Resultado esperado: cadastro e listagem persistem no banco.

Limite atual: visualizar, editar e excluir cursos pela tabela ainda estão desabilitados.

### Etapa 6 — Instrutores e convites

1. Abra **Instrutores**.
2. Confira o instrutor ativo e os indicadores.
3. Clique em **Novo instrutor**.
4. Use nome, e-mail e CPF ainda não cadastrados.
5. Envie o convite.
6. Confirme que o novo instrutor aparece como pendente de ativação.

Resultado esperado: usuário e instrutor são criados no banco e um token de ativação é gerado.

Limites atuais:

- o envio do e-mail depende das credenciais SMTP;
- se o e-mail falhar, o convite continua persistido;
- visualizar, editar, excluir e reenviar ativação diretamente pela tabela de instrutores ainda estão desabilitados.

### Etapa 7 — Alunos, detalhes e matrículas

1. Abra **Alunos**.
2. Teste busca e filtros.
3. Abra o detalhe de um aluno.
4. Edite nome, e-mail, telefone ou status da conta e salve.
5. Atualize a página e confirme a persistência.
6. Vincule um aluno sem matrícula a uma turma em andamento.
7. Altere o status de uma matrícula.
8. Se fizer sentido, cancele apenas a matrícula criada durante a demo.

#### Convite de aluno

1. Clique em **Novo aluno**.
2. Informe dados inéditos e selecione curso/turma.
3. Envie o convite.
4. Confirme o status pendente de ativação.
5. No detalhe do aluno pendente, teste **Reenviar ativação**.

Resultado esperado:

- aluno e conta são persistidos;
- matrícula é criada e pode ter status atualizado;
- o reenvio invalida o token anterior e cria um novo;
- o envio do e-mail depende do SMTP.

Limite atual: algumas ações rápidas da tabela, como editar/excluir diretamente pelos ícones, permanecem desabilitadas; a edição funcional fica na página de detalhe.

### Etapa 8 — Turmas e detalhe

1. Abra **Turmas**.
2. Confira filtros, quantidade de alunos e frequência média.
3. Clique em **Nova turma**.
4. Escolha um curso e um instrutor.
5. Informe código único, capacidade, período, turno, local e status.
6. Salve e confirme que a turma aparece na listagem.
7. Abra uma turma existente.
8. Mostre as abas de alunos e cronograma, alimentadas pela API.

Resultado esperado: criação, listagem e detalhe básico persistem.

Limites atuais:

- editar, excluir, alterar status e gerenciar algumas ações rápidas da turma ainda estão desabilitados;
- a aba de materiais no detalhe da turma usa dados locais;
- ações de editar/remover dentro das abas podem aparecer desabilitadas.

### Etapa 9 — Frequência do coordenador

1. Abra **Frequência**.
2. Confira percentual, presenças, faltas e situação do aluno.
3. Teste os filtros por curso, turma e situação.
4. Compare um aluno regular com um aluno em risco/reprovado por falta.

Resultado esperado: o consolidado é calculado pela API a partir dos registros de frequência.

Limite atual: a ação de abrir um detalhamento adicional pelo ícone da tabela ainda está desabilitada.

### Etapa 10 — Relatórios

1. Abra **Relatórios** no menu do coordenador.
2. Mostre que a página carrega informações reais do PostgreSQL.
3. Alterne entre os seis tipos disponíveis:
   - frequência por turma;
   - alunos reprovados por falta;
   - alunos elegíveis para certificado;
   - certificados emitidos;
   - matrículas por curso;
   - turmas em andamento.
4. Em cada tipo, confira título, descrição, métrica-resumo, gráfico e tabela.
5. Escolha um curso e confirme que o seletor de turmas passa a mostrar apenas as turmas daquele curso.
6. Aplique uma turma e confira a redução dos registros na prévia.
7. Aplique datas inicial e final e confirme que a interface impede um intervalo invertido.
8. Remova os filtros e confirme o retorno de todos os registros.

Resultado esperado:

- os seis relatórios são calculados pela API;
- a prévia atualiza imediatamente conforme os filtros;
- o gráfico mostra até oito registros e a tabela mostra o conjunto filtrado;
- a métrica é recalculada para os registros visíveis;
- frequência por turma usa a proporção total de presenças sobre registros, evitando uma média simples incorreta;
- a combinação curso/turma permanece coerente.

#### Exportar em PDF

1. Escolha um tipo de relatório.
2. Aplique filtros fáceis de identificar, por exemplo um curso específico.
3. Clique em **Gerar PDF**.
4. Abra o arquivo `relatorio-<tipo>.pdf`.
5. Confira título, descrição, data/hora de geração, filtros, métrica e tabela.
6. Confirme que o conteúdo do arquivo corresponde à prévia filtrada.

O PDF é gerado no backend em orientação paisagem, repete o cabeçalho em novas páginas e exibe uma mensagem apropriada quando os filtros não retornam dados.

#### Exportar em CSV

1. Mantenha os mesmos filtros.
2. Clique em **Exportar**.
3. Abra o arquivo `relatorio-<tipo>.csv` no Excel ou LibreOffice.
4. Confira título, descrição, geração, filtros, métrica, cabeçalhos e registros.
5. Verifique acentos e separação das colunas.

O CSV é gerado em UTF-8 com BOM e usa ponto e vírgula, favorecendo a abertura correta em planilhas configuradas para português do Brasil.

Proteções esperadas:

- apenas coordenador e administrador podem acessar as rotas;
- tipo de relatório desconhecido retorna erro de validação;
- datas inválidas ou intervalo com data inicial posterior à final são rejeitados;
- os mesmos filtros são reaplicados no backend durante a exportação, não apenas no navegador;
- falha de geração é apresentada na própria página;
- os botões ficam desabilitados enquanto um arquivo está sendo gerado.

### Etapa 11 — Certificados

1. Abra **Certificados**.
2. Filtre os registros por curso, turma ou status.
3. No certificado já emitido de Diego Martins, abra a pré-visualização.
4. Faça o download do PDF.
5. Mostre que alunos inelegíveis exibem o motivo.
6. Tente emitir para uma matrícula inelegível e mostre a proteção do backend.
7. Evite cancelar o certificado de Diego antes de terminar o preview e o download.

Resultado esperado:

- elegibilidade é validada no backend;
- o PDF é gerado a partir do template do projeto;
- emissão e cancelamento são persistidos;
- o certificado emitido pode ser visualizado e baixado.

A massa padrão possui um certificado já emitido, mas não possui outra matrícula simultaneamente aprovada, ativa, sem certificado e em turma concluída. Para demonstrar uma emissão bem-sucedida, prepare antes da reunião uma matrícula específica com essas condições. Não cancele o certificado de Diego esperando reemiti-lo: o registro cancelado continua associado à matrícula e a implementação atual não permite uma segunda emissão.

Proteções esperadas:

- matrícula não aprovada não recebe certificado;
- turma não concluída não recebe certificado;
- certificado ainda não emitido não pode ser baixado.

## 5. Testes opcionais de cadastro e ativação

Esses fluxos alteram os usuários de demonstração e os tokens são de uso único. Faça-os no fim ou recrie o banco depois.

### Cadastro público

1. Na tela inicial, clique em **Cadastre-se**.
2. Preencha dados pessoais, senha e tipo de aluno.
3. Se marcar aluno Unipê, confirme a exigência de RGM e curso.
4. Envie o cadastro.
5. Confira no coordenador que a conta ficou pendente de ativação.
6. Abra o link recebido por e-mail e conclua a ativação.
7. Faça login com a nova senha.

O cadastro é persistido mesmo se o envio de e-mail de ativação falhar; o erro de SMTP é tratado como efeito colateral.

### Tokens locais disponíveis após criar um banco novo

| Cenário | Usuário | URL |
|---|---|---|
| Cadastro público | João Ativação | `http://localhost:3000/ativar-conta?token=fcb88731d54aea7ff9123168b77442bb7f7822f0beb4e71668d33f90d5f7ecef` |
| Aluno convidado | Maria Convite | `http://localhost:3000/ativar-conta?token=ab29869ddce2d704033b0207aa5ecdd6f39103545d02e1b3e6f36b69842a168c` |
| Instrutor convidado | Eduardo Convite | `http://localhost:3000/ativar-conta?token=98fa8d3db1caa79c5070d6b613d215031d6c1d63746ccf083018bf0b6ae2b554` |

Esses links expiram três dias após a criação do banco e deixam de funcionar depois do primeiro uso.

Teste também:

- confirmação de senha diferente;
- senha com menos de oito caracteres;
- campos complementares obrigatórios;
- tentativa de reutilizar o mesmo token após a ativação.

### Recuperação de senha

1. No login, clique em **Recuperar Senha**.
2. Informe o e-mail de um usuário ativo.
3. Confirme a resposta genérica, que evita revelar se um e-mail existe.
4. Abra o link enviado por e-mail.
5. Defina uma senha com pelo menos oito caracteres.
6. Faça login com a nova senha.
7. Tente reutilizar o link e confirme que ele foi invalidado.

Observações:

- o envio real exige SMTP funcional;
- há bloqueio de nova solicitação por 15 minutos;
- o banco guarda apenas o hash do token;
- ao contrário dos convites, uma falha SMTP na recuperação pode interromper a resposta do fluxo e deve ser tratada como pendência antes de produção.

## 6. Matriz honesta de estado

| Área | Estado | O que demonstrar |
|---|---|---|
| Login, JWT e logout | Integrado | Login por perfil, CPF/e-mail, erro e saída |
| Cadastro/ativação | Integrado, dependente de SMTP | Validações, conta pendente e ativação |
| Recuperação de senha | Integrado, dependente de SMTP | Solicitação, redefinição e token de uso único |
| Dashboard do aluno | Integrado | Em andamento, aprovado e reprovado |
| Certificado do aluno | Integrado | Download autenticado via endpoint |
| Materiais do aluno | Integrado | Listagem e download autenticado |
| Dashboard do instrutor | Integrado | Presença, cronograma, material e avatar |
| Dashboard do coordenador | Integrado | Indicadores reais, período letivo, sem mock |
| Período letivo | Integrado | Automático + editável pelo coordenador |
| Cursos | Parcialmente integrado | Listar e criar |
| Turmas | Parcialmente integrado | Listar, criar e abrir detalhe |
| Alunos/matrículas | Integrado | Convidar, editar, vincular, alterar status |
| Instrutores | Parcialmente integrado | Listar e convidar |
| Frequência do coordenador | Integrado | Consolidado com badges coloridas |
| Certificados | Integrado | Elegibilidade, emissão, preview, PDF e cancelamento |
| Relatórios do coordenador | Integrado | Seis relatórios, filtros, gráfico, PDF e CSV |
| Cronograma, Processos, Usuários, Configurações | Em desenvolvimento | Páginas honestas com badge "Dev", sem mock |

## 7. O que falta explicar ao tech lead

### Funcionalidades ainda incompletas

- implementar Processos, Usuários, Configurações e Cronograma geral com
  endpoints reais (hoje são páginas "Em desenvolvimento" sem mock);
- concluir edição/exclusão de cursos, turmas, instrutores;
- manter rotas administrativas legadas de alunos protegidas por JWT de coordenador/admin;
- mover o JWT para cookie `HttpOnly`;
- definir armazenamento definitivo para uploads (hoje em volume local);
- acrescentar à massa de teste alunos com cenários de atenção (75-79%) e
  risco de reprovação (<75%);
- adicionar testes de frontend e testes E2E;
- revisar o comportamento de falha SMTP na recuperação de senha;
- implementar CI/CD.

### Pendências técnicas verificadas em 06/07/2026

- frontend: `npm run build` passou;
- API local: login e dashboards de aluno, instrutor e coordenador responderam `200`;
- relatórios: listagem dos seis tipos, PDF filtrado e CSV responderam `200`;
- backend: 26 testes Jest passando;
- certificado do aluno: download autenticado via `GET /alunos/me/certificado/pdf`
  com storage privado em `storage/certificados/`;
- período letivo: endpoint `GET /coordenador/periodo-letivo` funcional;
- não há suíte automatizada de frontend nem teste E2E configurado.

## 8. Checklist de cinco minutos antes da reunião

- [ ] Docker Desktop está ativo.
- [ ] Banco aparece como `healthy`.
- [ ] Backend responde na porta `8000`.
- [ ] Frontend abre na porta `3000`.
- [ ] Login do aluno funciona.
- [ ] Login do instrutor funciona e mostra dados reais.
- [ ] Login do coordenador funciona.
- [ ] Certificado de Diego abre em PDF.
- [ ] Os seis tipos de relatório carregam.
- [ ] Um PDF e um CSV de relatório foram baixados e abertos.
- [ ] Credenciais SMTP foram testadas, caso e-mail faça parte da demo.
- [ ] CPF/e-mail inéditos foram preparados para novos cadastros.
- [ ] Uma imagem menor que 5 MB foi separada para o avatar.
- [ ] Um curso/aula/material de teste foi planejado com nomes fáceis de remover.

## 9. Frase de fechamento sugerida

“O MVP já fecha os ciclos centrais de autenticação, acompanhamento acadêmico,
emissão de certificados e geração de relatórios para aluno, instrutor e
coordenador, com persistência real no PostgreSQL. As áreas em desenvolvimento
estão sinalizadas com badge Dev e sem dados falsos. As próximas entregas são
completar as áreas secundárias, automatizar o certificado e preparar a
infraestrutura de produção.”
