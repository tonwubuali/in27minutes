import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { formatMoney, ORDER_STAGES, stageIndex } from "../data/seed.js";
import { Badge, Button, Card, CountdownPill, toast } from "../components/ui.jsx";
import ProductArt from "../components/ProductArt.jsx";

// Live order queue. Each order's 27-minute countdown ticks here in sync with the
// customer's tracking screen (both read the order's placedAt). Advancing an order
// calls the API and updates the customer instantly.
export default function OrderQueue({ orders, earningsFor }) {
  const { advanceOrder } = useStore();
  const [busyId, setBusyId] = useState(null);

  if (orders.length === 0) {
    return (
      <Card className="p-10 text-center animate-fade-up">
        <p className="text-3xl animate-float">🎉</p>
        <p className="mt-2 font-bold">Queue is clear</p>
        <p className="text-sm text-slate-500">New orders in your zone appear here the moment a student checks out.</p>
      </Card>
    );
  }

  const sorted = [...orders].sort((a, b) => stageIndex(a.stage) - stageIndex(b.stage) || a.placedAt - b.placedAt);

  async function advance(o) {
    setBusyId(o.id);
    const nextLabel = { confirmed: "Accepted", assigned: "Picking", picking: "Out for delivery", delivering: "Delivered" }[o.stage];
    try { await advanceOrder(o.id); toast(`#${o.id.replace("ord-", "")} · ${nextLabel}`, "orange"); }
    finally { setBusyId(null); }
  }

  return (
    <div className="space-y-3 stagger">
      {sorted.map((o, i) => {
        const idx = stageIndex(o.stage);
        const basket = o.items.reduce((n, x) => n + x.price * x.qty, 0);
        const actionLabel = { confirmed: "Accept order", assigned: "Start picking", picking: "Out for delivery", delivering: "Mark delivered" }[o.stage];
        return (
          <Card key={o.id} hover className="p-4" style={{ "--i": i }}>
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

            <div className="mt-3 space-y-1 rounded-xl bg-brand-cloud p-3">
              {o.items.map((x) => (
                <div key={x.id} className="flex items-center gap-2 py-0.5 text-sm">
                  <ProductArt product={x} className="h-7 w-7" rounded="rounded-md" />
                  <span className="flex-1">{x.name}</span>
                  <span className="font-semibold text-slate-500">× {x.qty}</span>
                </div>
              ))}
              {o.note && <p className="mt-1 text-xs italic text-slate-400">Note: {o.note}</p>}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-slate-400">Basket </span><span className="font-semibold">{formatMoney(basket)}</span>
                <span className="mx-2 text-brand-line">|</span>
                <span className="text-slate-400">You earn </span><span className="font-bold text-emerald-600">{formatMoney(earningsFor(o))}</span>
              </div>
              {actionLabel && <Button onClick={() => advance(o)} disabled={busyId === o.id}>{busyId === o.id ? "…" : actionLabel}</Button>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
