import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { formatMoney, ORDER_STAGES, stageIndex } from "../data/seed.js";
import { Badge, Button, Card, CountdownPill } from "../components/ui.jsx";

// The live order queue. Each order has one forward action that advances it
// through the lifecycle. Advancing calls the API, which is exactly what updates
// the customer's tracking screen.
export default function OrderQueue({ orders, earningsFor }) {
  const { advanceOrder } = useStore();
  const [busyId, setBusyId] = useState(null);

  if (orders.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-3xl">🎉</p>
        <p className="mt-2 font-bold">Queue is clear</p>
        <p className="text-sm text-slate-500">
          No live orders in your neighborhood. New orders appear here the moment a customer checks
          out. (Sign in as the <span className="font-semibold">Customer</span> demo and place one to
          see it land.)
        </p>
      </Card>
    );
  }

  const sorted = [...orders].sort(
    (a, b) => stageIndex(a.stage) - stageIndex(b.stage) || a.placedAt - b.placedAt
  );

  async function advance(id) {
    setBusyId(id);
    try {
      await advanceOrder(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {sorted.map((o) => {
        const idx = stageIndex(o.stage);
        const basket = o.items.reduce((n, i) => n + i.price * i.qty, 0);
        const actionLabel = {
          confirmed: "Accept order",
          assigned: "Start picking",
          picking: "Out for delivery",
          delivering: "Mark delivered",
        }[o.stage];

        return (
          <Card key={o.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold">#{o.id.replace("ord-", "")}</span>
                  <Badge tone={o.stage === "confirmed" ? "orange" : "blue"}>{ORDER_STAGES[idx].agentLabel}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{o.customerName} · {o.address}</p>
              </div>
              <CountdownPill placedAt={o.placedAt} delivered={o.stage === "delivered"} />
            </div>

            <div className="mt-3 rounded-xl bg-brand-cloud p-3">
              {o.items.map((i) => (
                <div key={i.id} className="flex items-center gap-2 py-0.5 text-sm">
                  <span className="text-base">{i.emoji}</span>
                  <span className="flex-1">{i.name}</span>
                  <span className="font-semibold text-slate-500">× {i.qty}</span>
                </div>
              ))}
              {o.note && <p className="mt-1 text-xs italic text-slate-400">Note: {o.note}</p>}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-slate-400">Basket </span>
                <span className="font-semibold">{formatMoney(basket)}</span>
                <span className="mx-2 text-brand-line">|</span>
                <span className="text-slate-400">You earn </span>
                <span className="font-bold text-emerald-600">{formatMoney(earningsFor(o))}</span>
              </div>
              {actionLabel && (
                <Button onClick={() => advance(o.id)} disabled={busyId === o.id}>
                  {busyId === o.id ? "…" : actionLabel}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
