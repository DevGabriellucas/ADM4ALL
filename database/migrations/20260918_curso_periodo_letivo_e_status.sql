-- Aplicar com:
--   Get-Content .\database\migrations\20260918_curso_periodo_letivo_e_status.sql | docker compose exec -T db psql -U adm4all -d adm4all
--
-- Duas mudancas na tela de Cursos:
--
-- 1) O curso ganhou periodo letivo proprio, preenchido no cadastro, como a
--    turma ja tinha.
--
-- 2) O status do curso deixou de ser escolhido a mao. Ele agora sai do estado
--    das turmas, na leitura: sem turma ou sem aluno matriculado o curso esta
--    "em planejamento"; com turma e aluno, "ativo"; com todas as turmas
--    canceladas, "desativado". A coluna `treinamentos.status` fica para
--    historico e nenhuma consulta le mais o valor dela, entao nao adianta
--    corrigi-la aqui: o que a tela mostra e recalculado a cada consulta.

ALTER TABLE treinamentos
    ADD COLUMN IF NOT EXISTS periodo_letivo VARCHAR(6);

-- Os cursos que ja existiam herdam o periodo da turma mais recente. Os que
-- ainda nao tem turma ficam com o periodo letivo configurado no sistema, que e
-- o mesmo valor que o formulario de nova turma ja sugere.
UPDATE treinamentos t
SET periodo_letivo = COALESCE(
    (
        SELECT tu.periodo_letivo
        FROM turmas tu
        WHERE tu.treinamento_id = t.id
        ORDER BY tu.data_inicio DESC
        LIMIT 1
    ),
    (
        SELECT c.valor
        FROM configuracoes_sistema c
        WHERE c.chave = 'periodo_letivo'
          AND c.valor ~ '^[0-9]{4}\.[12]$'
        LIMIT 1
    ),
    '2026.1'
)
WHERE t.periodo_letivo IS NULL;

-- A coluna aceita NULL de proposito: curso cadastrado antes desta mudanca pode
-- nao ter periodo, e a API exige o campo so no cadastro e na edicao.
ALTER TABLE treinamentos
    DROP CONSTRAINT IF EXISTS chk_treinamentos_periodo_letivo;
ALTER TABLE treinamentos
    ADD CONSTRAINT chk_treinamentos_periodo_letivo
        CHECK (periodo_letivo IS NULL OR periodo_letivo ~ '^[0-9]{4}\.[12]$');

COMMENT ON COLUMN treinamentos.periodo_letivo IS
    'Periodo letivo do curso no formato AAAA.P (ex.: 2026.1).';
COMMENT ON COLUMN treinamentos.status IS
    'Legado. O status exibido e derivado das turmas do curso na consulta.';
