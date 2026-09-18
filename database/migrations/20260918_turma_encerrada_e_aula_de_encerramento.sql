-- Aplicar com:
--   Get-Content .\database\migrations\20260918_turma_encerrada_e_aula_de_encerramento.sql | docker compose exec -T db psql -U adm4all -d adm4all
--
-- Duas decisoes da coordenacao em 18/09:
--
-- 1) Turma que chega a 100% do cronograma passa a ficar "encerrada", e nao mais
--    "concluida". As duas palavras ja significavam a mesma coisa no sistema
--    (certificado e relatorio tratavam as duas juntas); ficou a que aparece na
--    tela. O CHECK continua aceitando 'concluida' por causa do historico, mas
--    nenhuma turma nova chega nele.
--
-- 2) A ultima aula do periodo (a decima) e a de encerramento: ninguem faz
--    chamada nela e a presenca vale para a turma inteira quando a aula e
--    marcada como realizada. Quem lanca e o sistema, com a observacao abaixo.

UPDATE turmas
SET status = 'encerrada'
WHERE status = 'concluida';

-- Turmas que ja fecharam antes desta mudanca podem ter a decima aula realizada
-- sem a presenca de encerramento. Este INSERT acerta o passado uma vez so; o
-- ON CONFLICT respeita a chamada que ja existir, porque a regra nova so vale
-- daqui para a frente e reescrever falta antiga mudaria historico de aluno.
INSERT INTO frequencias (
  matricula_id, aula_id, data_aula, presente, justificada, observacao
)
SELECT m.id, a.id, a.data_aula, TRUE, FALSE,
       'Presenca confirmada automaticamente na aula de encerramento.'
FROM aulas a
JOIN turmas t ON t.id = a.turma_id
JOIN matriculas m ON m.turma_id = t.id AND m.status <> 'cancelado'
WHERE a.numero_aula = 10
  AND a.status = 'realizada'
ON CONFLICT (matricula_id, aula_id) WHERE aula_id IS NOT NULL
DO NOTHING;
