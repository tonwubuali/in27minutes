import React, { useEffect } from "react";
import { useStore } from "../store.jsx";
import { ORDER_STAGES, stageIndex, formatMoney, PROMISE_MINUTES } from "../data/seed.js";
import { Button, Card, useCountdown } from "../components/ui.jsx";
import ProductArt from "../components/ProductArt.jsx";
import LiveMap from "../components/LiveMap.jsx";

export function promiseMiss(order, now = Date.now()) {
  const windowMs = PROMISE_MINUTES * 60 * 1000;
  const delivered = order.stage === "delivered";
  const elapsed = (delivered ? order.deliveredAt || order.placedAt : now) - order.placedAt;
  const missed = elapsed > windowMs;
  return { missed, cashback: missed ? order.deliveryFee || 0 : 0 };
}

const STATUS_COPY = {
  confirmed: "Finding you a runner",
  assigned: "Runner is heading to pick up",
  picking: "Runner is picking your items",
  delivering: "On the way to you",
  delivered: "Delivered",
};

export default function OrderTracking({ orderId, onBack }) {
  const { orders, neighborhoods, refreshOrders } = useStore();
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    const t = setInterval(refreshOrders, 4000);
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
  const { missed, cashback } = promiseMiss(order);

  return (
    <div className="mx-auto max-w-xl animate-fade-up">
      <button onClick={onBack} className="press mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-ink">← Back to store</button>

      <LiveMap stage={order.stage} originLabel={neighborhood?.name || "Runner"} destinationLabel="You" />

      {/* Status header */}
      <div className="-mt-6 px-2">
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-orangeDark">{delivered ? "Complete" : "Live"}</p>
            <p className="text-lg font-extrabold leading-tight">{STATUS_COPY[order.stage]}</p>
            <p className="text-xs text-slate-400">Order #{order.id.replace("ord-", "")} · {neighborhood?.name}</p>
          </div>
          <div className="text-right">
            {delivered ? (
              <span className="text-2xl">✅</span>
            ) : (
              <>
                <p className="text-2xl font-extrabold tabular-nums text-brand-ink">{passed ? "soon" : label}</p>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">{passed ? "almost there" : "to your door"}</p>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Cashback */}
      {missed && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200 animate-scale-in">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 font-bold text-white">₦</span>
          <div className="text-sm">
            <p className="font-bold text-emerald-800">{delivered ? "We missed 27 minutes — cashback added" : "Running late — cashback guaranteed"}</p>
            <p className="text-emerald-700">{formatMoney(cashback)} back to your in27 wallet.</p>
          </div>
        </div>
      )}

      {/* Runner */}
      {order.agentId && (
        <Card className="mt-3 flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-orange/15 text-xl">🛵</span>
          <div className="flex-1 text-sm">
            <p className="font-bold">Your runner is on it</p>
            <p className="text-slate-500">Fulfilling from {neighborhood?.name}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-cloud text-lg">💬</span>
        </Card>
      )}

      {/* Timeline */}
      <Card className="mt-3 p-4">
        <ol className="flex items-center justify-between">
          {ORDER_STAGES.map((s, idx) => {
            const done = idx <= current;
            return (
              <li key={s.key} className="flex flex-1 flex-col items-center text-center last:flex-none">
                <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold transition ${done ? "bg-brand-orange text-white" : "bg-brand-cloud text-slate-300"}`}>{done ? "✓" : idx + 1}</span>
                <span className={`mt-1 text-[10px] leading-tight ${idx === current ? "font-bold text-brand-ink" : "text-slate-400"}`}>{s.agentLabel}</span>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Items */}
      <Card className="mt-3 p-4">
        <p className="mb-2 text-sm font-bold">{order.items.length} items · {formatMoney(total)}</p>
        <div className="space-y-2">
          {order.items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 text-sm">
              <ProductArt product={i} className="h-9 w-9" rounded="rounded-xl" />
              <span className="flex-1 text-slate-700">{i.name}</span>
              <span className="text-slate-400">× {i.qty}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 border-t border-brand-line pt-3 text-sm text-slate-500">📍 {order.address}</p>
      </Card>
    </div>
  );
}
