import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL nao configurada.");
}

export const pool = new Pool({
  connectionString,
});

pool.on("error", (error) => {
  console.error("Erro inesperado na conexao com PostgreSQL:", error);
});
