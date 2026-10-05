const bcrypt = require("bcryptjs");
const { sql } = require("../lib/db");
const { setSession, readBody } = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  try {
    const { email, password } = await readBody(req);
    const mail = (email || "").trim().toLowerCase();
    if (!mail || !password || password.length < 6)
      return res.status(400).json({ error: "Informe e-mail e senha (mínimo 6 caracteres)." });

    const hash = bcrypt.hashSync(password, 10);
    let rows;
    try {
      rows = await sql`insert into users (email, password_hash)
                       values (${mail}, ${hash})
                       returning id, email`;
    } catch (e) {
      if (/duplicate|unique/i.test(e.message)) return res.status(409).json({ error: "Esse e-mail já tem conta. Faça login." });
      throw e;
    }
    const u = rows[0];
    setSession(res, u.id, u.email);
    return res.status(200).json({ email: u.email });
  } catch (e) {
    return res.status(500).json({ error: "Erro no servidor: " + e.message });
  }
};
