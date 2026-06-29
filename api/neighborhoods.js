import { sql, ensureSchema } from "./_lib/db.js";
import { withApi } from "./_lib/auth.js";

export default withApi(async (req, res) => {
  await ensureSchema();
  const neighborhoods = await sql`SELECT id, name, city FROM neighborhoods ORDER BY name`;
  return res.status(200).json({ neighborhoods });
});
