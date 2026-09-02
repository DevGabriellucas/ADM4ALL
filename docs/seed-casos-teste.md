# Casos de Teste - Alunos

> **Atenção — estas credenciais não existem mais por padrão.**
> O banco de produção foi limpo e os dados de teste saíram de
> `database/init/`. Para usar este roteiro, popule um ambiente de
> desenvolvimento primeiro:
>
> ```bash
> docker compose exec -T db psql -U adm4all -d adm4all < database/seeds/dev/20-inserir-dados-teste.sql
> docker compose exec -T db psql -U adm4all -d adm4all < database/seeds/dev/21-inserir-casos-demo-mvp.sql
> ```


> Alunos existentes no seed base (`database/init/20-inserir-dados-teste.sql`) e
> casos extras de demonstracao (`database/init/21-inserir-casos-demo-mvp.sql`).
> Ultima atualizacao: 09/07/2026.

## Casos base

| Nome | Email | Senha | Caso coberto | Status esperado | Observacao |
|---|---|---|---|---|---|
| Priscilla Cahino | `priscilla.cahino@example.com` | `Aluno@123` | Aluno em andamento | Progresso parcial, frequencia regular, materiais visiveis | Turma ADM-2026-01 |
| Diego Martins | `diego.martins@example.com` | `Aluno@123` | Aluno aprovado, **elegível** para certificado | Progresso 100%, 0 faltas. O certificado **não vem emitido**: a coordenação precisa emitir em Certificados > Emitir. Depois disso o aluno passa a ver "Acessar certificado" | Turma `CONTABIL-2026-01` (Assistente Contábil 2026.1 - Online, encerrada) |
| Jose Santos | `jose.santos@example.com` | `Aluno@123` | Aluno reprovado por falta | Alerta de reprovacao, sem certificado | 3 faltas registradas |
| Joao Ativacao | `joao.ativacao@example.com` | `Aluno@123` | Aluno pendente de ativacao | Login nao permitido ate ativar conta | Token de ativacao no seed |
| Maria Convite | `maria.convite@example.com` | `Aluno@123` | Aluna convidada pendente de ativacao | Login nao permitido ate ativar conta | Token de ativacao no seed |

## Casos extras de demonstracao

| Nome | Email | Senha | Caso coberto | O que testar |
|---|---|---|---|---|
| Ana Atencao | `ana.atencao@example.com` | `Aluno@123` | Frequencia 75% | Badge `atencao` em frequencia/coordenador |
| Bruno Risco | `bruno.risco@example.com` | `Aluno@123` | Frequencia 50% | Badge `risco_reprovacao`, diferente de reprovado |
| Gabriel Almeida | `gabriel.almeida@example.com` | `Aluno@123` | Aprovado sem certificado | Aluno elegivel para o coordenador emitir certificado |
| Lara Certificado | `lara.certificado@example.com` | `Aluno@123` | Certificado cancelado | Status cancelado e ausencia de download ativo no aluno |
| Nina Cancelada | `nina.cancelada@example.com` | `Aluno@123` | Matricula cancelada | Nao deve contar como aluno ativo da turma |
| Pedro Sem Matricula | `pedro.sem.matricula@example.com` | `Aluno@123` | Aluno sem matricula | Estado vazio/sem turma no painel do aluno |
| Olivia Oculto | `olivia.oculto@example.com` | `Aluno@123` | Material oculto | Material oculto nao aparece na area do aluno |

## Instrutores

Todos usam a senha `Instrutor@123`.

| Nome | E-mail | Turma vinculada | Tem dados? |
|---|---|---|---|
| Camila Rocha | `camila.rocha@example.com` | ADM-2026-01 (em andamento) | **Sim** — 8 alunos, 10 aulas, chamadas registradas |
| Eduardo Lima | `eduardo.lima@example.com` | todas as 6 turmas | **Sim**, mas vinculado a tudo — pouco realista para demonstrar |
| Rafael Mendes | `rafael.mendes@example.com` | CONT-2026-01 (em andamento) | **Não** — turma vazia: 0 alunos, 0 aulas |
| Juliana Torres | `juliana.torres@example.com` | RH-2026-01 | Não — turma vazia |
| Eduardo Convite | `eduardo.convite@example.com` | ADM-2026-01 | Sim (mesma turma da Camila) |

> **Para testar ou apresentar o perfil de instrutor, use Camila Rocha.**
> Rafael Mendes está numa turma sem alunos e sem aulas: o painel dele mostra
> tudo zerado, o que parece sistema quebrado mas é o dado.

## Turmas

| Código | Nome | Status | Alunos | Aulas |
|---|---|---|---|---|
| `ADM-2026-01` | Assistente Administrativo 2026.1 | em andamento | 8 | 10 |
| `CONTABIL-2026-01` | Assistente Contábil 2026.1 - Online | encerrada | 3 | 10 |
| `CONT-2026-01` | Assistente Contábil 2026.1 - Noite | em andamento | 0 | 0 |
| `MKT-2026-01`, `RH-2026-01`, `EMP-2026-01` | — | em andamento | 0 | 0 |

As duas turmas de Assistente Contábil existem de propósito (turnos
diferentes) e agora trazem o turno no nome, além do código exibido na
listagem — antes apareciam como duas linhas idênticas.

## Materiais

Os materiais do seed apontam para arquivos reais em
`database/seeds/materiais-exemplo/`, que precisam ser copiados para
`backend/uploads/materiais/` (veja `database/README.md`). O material de vídeo
é cadastrado **sem arquivo**, para exercitar esse estado na interface.

## Como aplicar o seed extra em banco existente

Com o Docker rodando:

```bash
docker exec adm4all_db psql -U adm4all -d adm4all -f /docker-entrypoint-initdb.d/21-inserir-casos-demo-mvp.sql
```

Em banco novo, o arquivo `21-inserir-casos-demo-mvp.sql` roda
automaticamente junto com os demais scripts em `database/init`.
