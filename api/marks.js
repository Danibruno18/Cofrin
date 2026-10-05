const { sql } = require("../lib/db");
const { currentUser, readBody } = require("../lib/auth");

module.exports = async (req, res) => {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ error: "Não autenticado." });
  const uid = u.uid;

  try {
    if (req.method === "GET") {
      const rows = await sql`select n from marks where user_id = ${uid} order by n`;
      return res.status(200).json({ marks: rows.map((r) => r.n) });
    }

    if (req.method === "POST") {
      const { n, add } = await readBody(req);
      const num = parseInt(n, 10);
      if (!(num >= 1 && num <= 500)) return res.status(400).json({ error: "Número inválido." });
      if (add) {
        await sql`insert into marks (user_id, n) values (${uid}, ${num})
                  on conflict (user_id, n) do nothing`;
      } else {
        await sql`delete from marks where user_id = ${uid} and n = ${num}`;
      }
      return res.status(200).json({ n: num, marked: !!add });
    }

    if (req.method === "DELETE") {
      await sql`delete from marks where user_id = ${uid}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (e) {
    return res.status(500).json({ error: "Erro no servidor: " + e.message });
  }
};
