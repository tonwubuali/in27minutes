import React, { useEffect } from "react";
import { useStore } from "../store.jsx";
import { ORDER_STAGES, stageIndex, formatMoney, PROMISE_MINUTES } from "../data/seed.js";
import { Button, Card, CountdownRing, useCountdown } from "../components/ui.jsx";
import ProductArt from "../components/ProductArt.jsx";

// Returns cashback owed if the 27-minute promise was (or is being) missed.
export function promiseMiss(order, now = Date.now()) {
  const windowMs = PROMISE_MINUTES * 60 * 1000;
  const delivered = order.stage === "delivered";
  const elapsed = (delivered ? order.deliveredAt || order.placedAt : now) - order.placedAt;
  const missed = elapsed > windowMs;
  return { missed, cashback: missed ? order.deliveryFee || 0 : 0 };
}

export default function OrderTracking({ orderId, onBack }) {
  const { orders, neighborhoods, refreshOrders } = useStore();
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    const t = setInterval(refreshOrders, 5000);
    return () => clearInterval(t);
  }, [refreshOrders]);

  const { passed } = useCountdown(order ? order.placedAt : Date.now());

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
  const { missed, cashback } = promiseMiss(order);

  return (
    <div className="mx-auto max-w-xl animate-fade-up">
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-slate-500 hover:text-brand-ink">← Back to store</button>

      <Card className="overflow-hidden">
        <div className="relative flex flex-col items-center bg-brand-ink px-5 py-7 text-white">
          <div className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full bg-brand-orange/20 blur-2xl" />
          <p className="mb-3 text-xs uppercase tracking-wide text-white/50">Order #{order.id.replace("ord-", "")}</p>
          {delivered ? (
            <div className="grid h-[168px] w-[168px] place-items-center rounded-full border-8 border-emerald-500/30 text-center">
              <span className="text-2xl font-extrabold text-emerald-400">Delivered ✓</span>
            </div>
          ) : (
            <CountdownRing placedAt={order.placedAt} />
          )}
        </div>

        <div className="p-5">
          {/* Cashback banner when the 27-min promise is missed */}
          {missed && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 animate-scale-in">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white">₦</span>
              <div className="text-sm">
                <p className="font-bold text-emerald-800">{delivered ? "We missed 27 minutes — cashback added" : "Running late — cashback guaranteed"}</p>
                <p className="text-emerald-700">{formatMoney(cashback)} back to your in27 wallet for this order.</p>
              </div>
            </div>
          )}

          {order.agentId ? (
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-brand-cloud p-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-orange/15 text-lg">🛵</span>
              <div className="text-sm"><p className="font-bold">A runner has your order</p><p className="text-slate-500">Fulfilling from {neighborhood?.name}</p></div>
            </div>
          ) : (
            <p className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Finding an available runner in {neighborhood?.name}…</p>
          )}

          <ol className="relative ml-3 border-l-2 border-brand-line">
            {ORDER_STAGES.map((s, idx) => {
              const done = idx < current, active = idx === current;
              return (
                <li key={s.key} className="mb-5 ml-5 last:mb-0">
                  <span className={`absolute -left-[11px] grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold transition ${done ? "bg-emerald-500 text-white" : active ? "bg-brand-orange text-white ring-4 ring-brand-orange/20" : "bg-white text-slate-300 ring-2 ring-brand-line"}`}>{done ? "✓" : idx + 1}</span>
                  <p className={`text-sm transition ${active ? "font-bold text-brand-ink" : done ? "text-slate-500" : "text-slate-400"}`}>{s.label}</p>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 rounded-xl border border-brand-line p-4 text-sm">
            <p className="mb-2 font-bold">{order.items.length} items · {formatMoney(total)}</p>
            <div className="space-y-1.5">
              {order.items.map((i) => (
                <div key={i.id} className="flex items-center gap-2 text-slate-600">
                  <ProductArt product={i} className="h-7 w-7" rounded="rounded-md" />
                  <span>{i.name} × {i.qty}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-slate-400">Deliver to: {order.address}</p>
          </div>

          {!delivered && <p className="mt-4 text-center text-xs text-slate-400">Updates live as your runner works the order.</p>}
        </div>
      </Card>
    </div>
  );
}
