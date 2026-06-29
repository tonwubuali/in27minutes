import React, { useEffect } from "react";
import { useStore } from "../store.jsx";
import { ORDER_STAGES, stageIndex, formatMoney } from "../data/seed.js";
import { Button, Card, useCountdown } from "../components/ui.jsx";

// Live order tracking: the 27-minute countdown plus the same stage timeline the
// agent drives from their side. Polls the API so the agent's actions show up here.
export default function OrderTracking({ orderId, onBack }) {
  const { orders, neighborhoods, refreshOrders } = useStore();
  const order = orders.find((o) => o.id === orderId);

  // Poll for updates while watching an in-flight order.
  useEffect(() => {
    const t = setInterval(refreshOrders, 5000);
    return () => clearInterval(t);
  }, [refreshOrders]);

  const { label, passed } = useCountdown(order ? order.placedAt : Date.now());

  if (!order) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-slate-500">Order not found.</p>
        <Button className="mt-4" onClick={onBack}>Back to store</Button>
      </div>
    );
  }

  const current = stageIndex(order.stage);
  const delivered = order.stage === "delivered";
  const neighborhood = neighborhoods.find((n) => n.id === order.neighborhoodId);
  const total = order.items.reduce((n, i) => n + i.price * i.qty, 0) + (order.deliveryFee || 0);

  return (
    <div className="mx-auto max-w-xl">
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-slate-500 hover:text-brand-ink">
        ← Back to store
      </button>

      <Card className="overflow-hidden">
        <div className="bg-brand-ink px-5 py-6 text-center text-white">
          <p className="text-xs uppercase tracking-wide text-white/50">Order #{order.id.replace("ord-", "")}</p>
          {delivered ? (
            <p className="mt-2 text-3xl font-extrabold text-emerald-400">Delivered ✓</p>
          ) : passed ? (
            <p className="mt-2 text-2xl font-extrabold">Almost there…</p>
          ) : (
            <>
              <p className="mt-2 text-5xl font-extrabold tabular-nums">{label}</p>
              <p className="text-sm text-white/60">estimated time to your door</p>
            </>
          )}
        </div>

        <div className="p-5">
          {order.agentId ? (
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-brand-cloud p-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-orange/15 text-lg">🛵</span>
              <div className="text-sm">
                <p className="font-bold">An agent has your order</p>
                <p className="text-slate-500">Fulfilling locally from {neighborhood?.name}</p>
              </div>
            </div>
          ) : (
            <p className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              Finding an available agent in {neighborhood?.name}…
            </p>
          )}

          <ol className="relative ml-3 border-l-2 border-brand-line">
            {ORDER_STAGES.map((s, idx) => {
              const done = idx < current;
              const active = idx === current;
              return (
                <li key={s.key} className="mb-5 ml-5 last:mb-0">
                  <span
                    className={`absolute -left-[11px] grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                        ? "bg-brand-orange text-white ring-4 ring-brand-orange/20"
                        : "bg-white text-slate-300 ring-2 ring-brand-line"
                    }`}
                  >
                    {done ? "✓" : idx + 1}
                  </span>
                  <p className={`text-sm ${active ? "font-bold text-brand-ink" : done ? "text-slate-500" : "text-slate-400"}`}>
                    {s.label}
                  </p>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 rounded-xl border border-brand-line p-4 text-sm">
            <p className="mb-2 font-bold">{order.items.length} items · {formatMoney(total)}</p>
            {order.items.map((i) => (
              <p key={i.id} className="text-slate-500">{i.emoji} {i.name} × {i.qty}</p>
            ))}
            <p className="mt-2 text-slate-400">Deliver to: {order.address}</p>
          </div>

          {!delivered && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Updates live as your agent works the order.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
