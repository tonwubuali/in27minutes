import { sql, ensureSchema } from "./_lib/db.js";
import { withApi, readBody } from "./_lib/auth.js";

// POST /api/applications  -> public: a prospective agent applies.
// GET  /api/applications  -> admin: review the pipeline.
export default withApi(
  async (req, res, auth) => {
    await ensureSchema();

    if (req.method === "POST") {
      const b = readBody(req);
      if (!b.name || !b.phone) return res.status(400).json({ error: "Name and phone required" });
      const id = "app-" + Date.now();
      const [{ name: nbName } = {}] =
        await sql`SELECT name FROM neighborhoods WHERE id = ${b.neighborhoodId}`;
      await sql`INSERT INTO applications (id, name, phone, neighborhood_id, neighborhood_name, has_storage, vehicle, status, submitted_at)
                VALUES (${id}, ${b.name}, ${b.phone}, ${b.neighborhoodId}, ${nbName || ""}, ${b.hasStorage || ""}, ${b.vehicle || ""}, 'pending', ${Date.now()})`;
      const [created] = await sql`SELECT * FROM applications WHERE id = ${id}`;
      return res.status(201).json({ application: normalize(created) });
    }

    // GET — admin only
    if (!auth || auth.role !== "admin") return res.status(403).json({ error: "Not authorized" });
    const rows = await sql`SELECT * FROM applications ORDER BY submitted_at DESC`;
    return res.status(200).json({ applications: rows.map(normalize) });
  },
  { roles: null } // public POST; GET checks admin inside
);

function normalize(a) {
  return {
    id: a.id,
    name: a.name,
    phone: a.phone,
    neighborhoodId: a.neighborhood_id,
    neighborhoodName: a.neighborhood_name,
    hasStorage: a.has_storage,
    vehicle: a.vehicle,
    status: a.status,
    submittedAt: Number(a.submitted_at),
  };
}
