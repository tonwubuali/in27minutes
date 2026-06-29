import { sql, ensureSchema } from "./_lib/db.js";
import { withApi, readBody } from "./_lib/auth.js";

// POST /api/approve?id=<applicationId>  -> admin approves (or rejects) an applicant.
// Approving turns the applicant into a live agent and creates a login for them.
export default withApi(
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    await ensureSchema();

    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing application id" });

    const { decision = "approve" } = readBody(req);
    const [app] = await sql`SELECT * FROM applications WHERE id = ${id}`;
    if (!app) return res.status(404).json({ error: "Application not found" });

    if (decision === "reject") {
      await sql`UPDATE applications SET status = 'rejected' WHERE id = ${id}`;
      return res.status(200).json({ status: "rejected" });
    }

    const agentId = "agent-" + id.replace("app-", "a");
    await sql`INSERT INTO agents (id, name, neighborhood_id, rating, deliveries, status, joined)
              VALUES (${agentId}, ${app.name}, ${app.neighborhood_id}, 5.0, 0, 'active', ${new Date().toISOString().slice(0, 10)})
              ON CONFLICT (id) DO NOTHING`;

    const email = slug(app.name) + "@in27minutes.com";
    const bcrypt = (await import("bcryptjs")).default;
    await sql`INSERT INTO users (email, password_hash, name, role, agent_id)
              VALUES (${email}, ${bcrypt.hashSync("demo1234", 10)}, ${app.name}, 'agent', ${agentId})
              ON CONFLICT (email) DO NOTHING`;

    await sql`UPDATE applications SET status = 'approved' WHERE id = ${id}`;

    return res.status(200).json({ status: "approved", agentId, login: { email, password: "demo1234" } });
  },
  { roles: ["admin"] }
);

function slug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
}
