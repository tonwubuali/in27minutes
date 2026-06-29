import { sql, ensureSchema } from "./_lib/db.js";
import { withApi } from "./_lib/auth.js";

// Agents directory. Visible to agents (to resolve their own record) and admins.
export default withApi(
  async (req, res) => {
    await ensureSchema();
    const agents = await sql`SELECT id, name, neighborhood_id AS "neighborhoodId", rating, deliveries, status, joined FROM agents ORDER BY name`;
    return res.status(200).json({ agents });
  },
  { roles: ["agent", "admin"] }
);
