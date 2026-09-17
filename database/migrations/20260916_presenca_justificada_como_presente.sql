-- Presenca justificada recebe credito de presenca e nao reduz a frequencia.
-- A constraint antiga impedia presente = TRUE junto com justificada = TRUE.
ALTER TABLE frequencias
DROP CONSTRAINT IF EXISTS chk_frequencias_justificada;