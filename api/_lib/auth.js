// Auth + request helpers shared by all serverless functions.
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, name: user.name, agentId: user.agent_id || null },
    SECRET,
    { expiresIn: "30d" }
  );
}

export function getAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Wrap a handler with CORS + optional role requirement.
// roles: null = public, [] = any logged-in user, ["admin"] = admins only, etc.
export function withApi(handler, { roles = null } = {}) {
  return async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).end();

    let auth = null;
    if (roles !== null) {
      auth = getAuth(req);
      if (!auth) return res.status(401).json({ error: "Not authenticated" });
      if (roles.length && !roles.includes(auth.role)) {
        return res.status(403).json({ error: "Not authorized" });
      }
    } else {
      auth = getAuth(req); // attach if present, but don't require
    }

    try {
      return await handler(req, res, auth);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error", detail: String(err?.message || err) });
    }
  };
}

// Vercel parses JSON bodies into req.body, but guard for string bodies too.
export function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}
