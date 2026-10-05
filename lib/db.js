// Conexão com o Neon (Postgres) via driver serverless HTTP.
// A connection string NUNCA fica no código: vem da variável de ambiente DATABASE_URL.
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida — configure nas variáveis de ambiente da Vercel.");
}

const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };
