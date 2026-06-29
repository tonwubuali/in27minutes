import { sql, ensureSchema } from "./_lib/db.js";
import { withApi } from "./_lib/auth.js";

export default withApi(async (req, res) => {
  await ensureSchema();
  const products = await sql`SELECT id, name, category, price, unit, emoji FROM products ORDER BY category, name`;
  return res.status(200).json({ products });
});
