import { sql, ensureSchema } from "./_lib/db.js";
import { withApi } from "./_lib/auth.js";

const ORDER_STAGES = ["confirmed", "assigned", "picking", "delivering", "delivered"];

// POST /api/advance?id=<orderId>  -> move an order one step forward.
// Agents and admins can advance. The first advance (confirmed -> assigned) claims
// the order for the acting agent.
export default withApi(
  async (req, res, auth) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    await ensureSchema();

    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing order id" });

    const [order] = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (!order) return res.status(404).json({ error: "Order not found" });

    const idx = ORDER_STAGES.indexOf(order.stage);
    const next = ORDER_STAGES[Math.min(idx + 1, ORDER_STAGES.length - 1)];
    const agentId = order.agent_id || auth.agentId || null;
    // Stamp delivery time so cashback (missed 27-min promise) can be computed.
    const deliveredAt = next === "delivered" ? Date.now() : order.delivered_at || null;

    await sql`UPDATE orders SET stage = ${next}, agent_id = ${agentId}, delivered_at = ${deliveredAt} WHERE id = ${id}`;
    const [u] = await sql`SELECT * FROM orders WHERE id = ${id}`;

    return res.status(200).json({
      order: {
        id: u.id,
        source: u.source,
        customerName: u.customer_name,
        neighborhoodId: u.neighborhood_id,
        agentId: u.agent_id,
        address: u.address,
        note: u.note,
        items: typeof u.items === "string" ? JSON.parse(u.items) : u.items,
        stage: u.stage,
        placedAt: Number(u.placed_at),
        deliveryFee: u.delivery_fee,
        deliveredAt: u.delivered_at ? Number(u.delivered_at) : null,
      },
    });
  },
  { roles: ["agent", "admin"] }
);
