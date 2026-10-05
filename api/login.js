const bcrypt = require("bcryptjs");
const { sql } = require("../lib/db");
const { setSession, readBody } = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  try {
    const { email, password } = await readBody(req);
    const mail = (email || "").trim().toLowerCase();
    if (!mail || !password) return res.status(400).json({ error: "Informe e-mail e senha." });

    const rows = await sql`select id, email, password_hash from users where email = ${mail}`;
    const u = rows[0];
    if (!u || !bcrypt.compareSync(password, u.password_hash))
      return res.status(401).json({ error: "E-mail ou senha incorretos." });

    setSession(res, u.id, u.email);
    return res.status(200).json({ email: u.email });
  } catch (e) {
    return res.status(500).json({ error: "Erro no servidor: " + e.message });
  }
};
