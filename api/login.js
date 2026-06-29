import bcrypt from "bcryptjs";
import { sql, ensureSchema } from "./_lib/db.js";
import { signToken, withApi, readBody } from "./_lib/auth.js";

export default withApi(async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  await ensureSchema();

  const { email, password } = readBody(req);
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const rows = await sql`SELECT * FROM users WHERE email = ${String(email).toLowerCase().trim()}`;
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  return res.status(200).json({
    token,
    user: { id: user.id, name: user.name, role: user.role, agentId: user.agent_id || null },
  });
});
