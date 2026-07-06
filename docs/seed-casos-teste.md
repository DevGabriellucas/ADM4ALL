# Casos de Teste — Alunos

> Alunos existentes no seed atual (`database/init/20-inserir-dados-teste.sql`).
> Última atualização: 06/07/2026.

## Casos já cobertos

| Nome | Email | Senha | Caso coberto | Status esperado | Observação |
|---|---|---|---|---|---|
| Priscilla Cahino | `priscilla.cahino@example.com` | `Aluno@123` | Aluno em andamento | Progresso parcial, frequência regular, materiais visíveis | Turma ADM-2026-01 |
| Diego Martins | `diego.martins@example.com` | `Aluno@123` | Aluno aprovado com certificado emitido | Progresso 100%, botão "Acessar certificado" | Turma Excel Básico (concluída). Certificado `CERT-ADM-2026-0001` |
| José Santos | `jose.santos@example.com` | `Aluno@123` | Aluno reprovado por falta | Alerta de reprovação, sem certificado | 3 faltas registradas |
| João Ativação | `joao.ativacao@example.com` | `Aluno@123` | Aluno pendente de ativação | Login não permitido até ativar conta | Token de ativação: `fcb88731d54aea7f...` |
| Maria Convite | `maria.convite@example.com` | `Aluno@123` | Aluna convidada pendente de ativação | Login não permitido até ativar conta | Token de ativação: `ab29869ddce2d704...` |

## Casos faltantes recomendados

> A criação destes alunos deve ser feita em tarefa separada de seed.

| Caso | Frequência esperada | Situação | O que testar |
|---|---|---|---|
| Aluno em atenção | 75-79% | `atencao` | Badge âmbar no dashboard do coordenador e na frequência |
| Aluno em risco de reprovação | < 75% | `risco_reprovacao` | Badge laranja, diferenciado de reprovado |
| Aluno aprovado sem certificado | >= 80%, aprovado, turma concluída | `aprovado` | Elegível para certificado, botão "Emitir" aparece para o coordenador |
| Aluno com certificado cancelado | aprovado, turma concluída | `aprovado` | Certificado aparece como cancelado, sem botão de download |
| Aluno com matrícula cancelada | N/A | `cancelado` | Não aparece no dashboard como ativo |
| Aluno sem matrícula | N/A | N/A | Dashboard mostra estado adequado (ex: "sem matrícula") |
| Aluno com materiais ocultos | N/A | N/A | Materiais com `visivel_aluno = FALSE` não aparecem na listagem |

## Script auxiliar

Para criar um aluno elegível para certificado (aprovado, turma concluída,
0 faltas, sem certificado), executar:

```bash
docker exec -i adm4all_db psql -U adm4all -d adm4all < database/init/21-inserir-aluno-demo-aprovacao.sql
```

Isso cria o aluno **Gabriel Almeida** (`gabriel.almeida@example.com` /
`Aluno@123`) com matrícula `em_andamento` na turma concluída de Excel Básico.
O coordenador deve primeiro aprovar a matrícula (alterar status para
`aprovado`) e depois emitir o certificado.
