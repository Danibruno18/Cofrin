// Sessão por JWT (HS256) assinado com JWT_SECRET, guardado em cookie httpOnly.
const crypto = require("crypto");

const SECRET = process.env.JWT_SECRET || "";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const data = header + "." + body;
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return data + "." + sig;
}

function verify(token) {
  if (!token || !SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const data = parts[0] + "." + parts[1];
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(parts[1], "base64url").toString()); }
  catch { return null; }
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((c) => {
    const i = c.indexOf("=");
    if (i > -1) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

function setSession(res, uid, email) {
  const token = sign({ uid, email, exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  res.setHeader("Set-Cookie",
    `token=${token}; HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=${MAX_AGE}`);
}

function clearSession(res) {
  res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=0");
}

function currentUser(req) {
  return verify(parseCookies(req).token);
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  return await new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

module.exports = { sign, verify, setSession, clearSession, currentUser, readBody };
