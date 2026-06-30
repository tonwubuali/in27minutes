import { sql, ensureSchema } from "./_lib/db.js";
import { withApi, readBody } from "./_lib/auth.js";

const ORDER_STAGES = ["confirmed", "assigned", "picking", "delivering", "delivered"];

// GET  /api/orders  -> role-scoped list
//   admin   : all orders
//   agent   : orders in the agent's neighborhood
//   customer: their own orders (matched by customer user id stored on order.source? )
//             customers pass ?mine=1 with their placed order ids client-side; to keep
//             it simple and private, customer orders are filtered by the user id we
//             stamp into source as "customer:<id>".
// POST /api/orders -> create order (any logged-in user; customer flow)
export default withApi(
  async (req, res, auth) => {
    await ensureSchema();

    if (req.method === "POST") {
      const b = readBody(req);
      if (!b.items?.length) return res.status(400).json({ error: "Order needs items" });
      const id = "ord-" + Math.floor(1100 + Math.random() * 8800);
      const source = "customer:" + auth.sub;
      const row = {
        id,
        source,
        customer_name: b.customerName || auth.name || "Customer",
        neighborhood_id: b.neighborhoodId,
        agent_id: null,
        address: b.address || "",
        note: b.note || "",
        items: JSON.stringify(b.items),
        stage: "confirmed",
        placed_at: Date.now(),
        delivery_fee: b.deliveryFee ?? 700,
      };
      await sql`INSERT INTO orders (id, source, customer_name, neighborhood_id, agent_id, address, note, items, stage, placed_at, delivery_fee)
                VALUES (${row.id}, ${row.source}, ${row.customer_name}, ${row.neighborhood_id}, ${row.agent_id}, ${row.address}, ${row.note}, ${row.items}, ${row.stage}, ${row.placed_at}, ${row.delivery_fee})`;
      const [created] = await sql`SELECT * FROM orders WHERE id = ${id}`;
      return res.status(201).json({ order: normalize(created) });
    }

    // GET
    let rows;
    if (auth.role === "admin") {
      rows = await sql`SELECT * FROM orders ORDER BY placed_at DESC`;
    } else if (auth.role === "agent") {
      const [agent] = await sql`SELECT neighborhood_id FROM agents WHERE id = ${auth.agentId}`;
      const nb = agent?.neighborhood_id || "__none__";
      rows = await sql`SELECT * FROM orders WHERE neighborhood_id = ${nb} ORDER BY placed_at DESC`;
    } else {
      rows = await sql`SELECT * FROM orders WHERE source = ${"customer:" + auth.sub} ORDER BY placed_at DESC`;
    }
    return res.status(200).json({ orders: rows.map(normalize) });
  },
  { roles: [] }
);

function normalize(o) {
  return {
    id: o.id,
    source: o.source,
    customerName: o.customer_name,
    neighborhoodId: o.neighborhood_id,
    agentId: o.agent_id,
    address: o.address,
    note: o.note,
    items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
    stage: o.stage,
    placedAt: Number(o.placed_at),
    deliveryFee: o.delivery_fee,
    deliveredAt: o.delivered_at ? Number(o.delivered_at) : null,
  };
}

export { ORDER_STAGES, normalize };
