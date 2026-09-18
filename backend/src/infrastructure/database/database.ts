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

// Uma tela abre varias chamadas de uma vez — o painel da coordenacao dispara
// sete em paralelo — e cada uma segura uma conexao enquanto dura. Com o padrao
// do `pg`, que e 10, duas pessoas abrindo o painel juntas ja estouravam o pool.
// O Postgres do projeto aceita 100 conexoes, entao 20 deixa folga para o
// Adminer e para uma sessao de psql sem chegar perto do teto.
const MAX_CONEXOES = 20;

// Sem isto o padrao e esperar para sempre por uma conexao livre: numa rajada a
// tela ficava girando sem fim, em vez de falhar e deixar o usuario tentar de
// novo. Dez segundos ja e muito mais que qualquer consulta daqui (a mais lenta
// medida da 174 ms).
const ESPERA_MAXIMA_POR_CONEXAO_MS = 10_000;

// Conexao ociosa e devolvida depois disto. Meio minuto evita ficar abrindo e
// fechando conexao a cada clique, que era o efeito do padrao de 10 segundos.
const OCIOSIDADE_MAXIMA_MS = 30_000;

export const pool = new Pool({
  connectionString,
  options: `-c timezone=${FUSO_HORARIO}`,
  max: MAX_CONEXOES,
  connectionTimeoutMillis: ESPERA_MAXIMA_POR_CONEXAO_MS,
  idleTimeoutMillis: OCIOSIDADE_MAXIMA_MS,
});

pool.on("error", (error) => {
  console.error("Erro inesperado na conexao com PostgreSQL:", error);
});
