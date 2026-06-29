// Shared front-end constants and formatting helpers.
// The actual catalog / agents / orders now live in Postgres and arrive via the
// API (see src/api.js and the /api functions). This file only holds the
// presentation-layer constants the UI needs.

export const CATEGORIES = ["Groceries", "Pharmacy", "Food & Drinks", "Electronics", "Home"];

export const CURRENCY = "₦";

export function formatMoney(n) {
  return CURRENCY + Number(n || 0).toLocaleString("en-NG");
}

// The promise. Drives the countdown everywhere.
export const PROMISE_MINUTES = 27;

// Order lifecycle. Index order matters — it's the progress timeline. Must match
// the stages used by the API (api/orders.js + api/orders/[id]/advance.js).
export const ORDER_STAGES = [
  { key: "confirmed", label: "Order confirmed", agentLabel: "New order" },
  { key: "assigned", label: "Agent assigned", agentLabel: "Accepted" },
  { key: "picking", label: "Agent is picking", agentLabel: "Picking" },
  { key: "delivering", label: "Out for delivery", agentLabel: "Out for delivery" },
  { key: "delivered", label: "Delivered", agentLabel: "Delivered" },
];

export function stageIndex(key) {
  return ORDER_STAGES.findIndex((s) => s.key === key);
}
