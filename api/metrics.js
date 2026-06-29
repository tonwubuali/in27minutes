import { sql, ensureSchema } from "./_lib/db.js";
import { withApi } from "./_lib/auth.js";

// GET /api/metrics -> admin dashboard summary.
export default withApi(
  async (req, res) => {
    await ensureSchema();

    const [[orderStats], [agentCount], [appCount], byStage] = await Promise.all([
      sql`SELECT count(*)::int AS total,
                 count(*) FILTER (WHERE stage = 'delivered')::int AS delivered,
                 count(*) FILTER (WHERE stage <> 'delivered')::int AS active
          FROM orders`,
      sql`SELECT count(*)::int AS c FROM agents WHERE status = 'active'`,
      sql`SELECT count(*)::int AS c FROM applications WHERE status = 'pending'`,
      sql`SELECT neighborhood_id, count(*)::int AS c FROM orders GROUP BY neighborhood_id`,
    ]);

    // Revenue = delivered baskets + delivery fees (computed from items jsonb).
    const revRows = await sql`
      SELECT items, delivery_fee FROM orders WHERE stage = 'delivered'`;
    let revenue = 0;
    for (const r of revRows) {
      const items = typeof r.items === "string" ? JSON.parse(r.items) : r.items;
      revenue += (items || []).reduce((n, i) => n + i.price * i.qty, 0) + (r.delivery_fee || 0);
    }

    return res.status(200).json({
      orders: orderStats,
      activeAgents: agentCount.c,
      pendingApplications: appCount.c,
      revenue,
      ordersByNeighborhood: byStage,
    });
  },
  { roles: ["admin"] }
);
