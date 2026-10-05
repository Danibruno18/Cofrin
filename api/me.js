const { currentUser } = require("../lib/auth");

module.exports = async (req, res) => {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ error: "Não autenticado." });
  return res.status(200).json({ email: u.email });
};
