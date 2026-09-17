import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL nao configurada.");
}

// O container do Postgres roda em UTC, entao CURRENT_DATE virava o dia as 21h
// de Joao Pessoa: certificado emitido a noite saia datado do dia seguinte, e o
// mesmo valia para data_conclusao e para as comparacoes com data_aula.
//
// Resolvido na conexao, e nao query a query: sao mais de 30 usos de
// CURRENT_DATE/NOW() no backend e qualquer consulta nova nasceria com o mesmo
// furo. As expressoes que ja convertem explicitamente
// (`now() AT TIME ZONE 'America/Sao_Paulo'`) continuam corretas, porque
// independem do fuso da sessao.
const FUSO_HORARIO = "America/Sao_Paulo";

export const pool = new Pool({
  connectionString,
  options: `-c timezone=${FUSO_HORARIO}`,
});

pool.on("error", (error) => {
  console.error("Erro inesperado na conexao com PostgreSQL:", error);
});
