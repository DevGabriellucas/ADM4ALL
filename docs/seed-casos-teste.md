# Casos de Teste - Alunos

> Alunos existentes no seed base (`database/init/20-inserir-dados-teste.sql`) e
> casos extras de demonstracao (`database/init/21-inserir-casos-demo-mvp.sql`).
> Ultima atualizacao: 09/07/2026.

## Casos base

| Nome | Email | Senha | Caso coberto | Status esperado | Observacao |
|---|---|---|---|---|---|
| Priscilla Cahino | `priscilla.cahino@example.com` | `Aluno@123` | Aluno em andamento | Progresso parcial, frequencia regular, materiais visiveis | Turma ADM-2026-01 |
| Diego Martins | `diego.martins@example.com` | `Aluno@123` | Aluno aprovado com certificado emitido | Progresso 100%, botao "Acessar certificado" | Turma Excel Basico concluida. Certificado `CERT-ADM-2026-0001` |
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

## Como aplicar o seed extra em banco existente

Com o Docker rodando:

```bash
docker exec adm4all_db psql -U adm4all -d adm4all -f /docker-entrypoint-initdb.d/21-inserir-casos-demo-mvp.sql
```

Em banco novo, o arquivo `21-inserir-casos-demo-mvp.sql` roda
automaticamente junto com os demais scripts em `database/init`.
