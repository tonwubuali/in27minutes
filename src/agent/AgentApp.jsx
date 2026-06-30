import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { formatMoney } from "../data/seed.js";
import { Badge, Card } from "../components/ui.jsx";
import OrderQueue from "./OrderQueue.jsx";
import Inventory from "./Inventory.jsx";

// The field agent's operations app. The signed-in agent "owns" a neighborhood;
// the API already scopes their orders to it. Tabs: live queue, inventory, earnings.
const FULFILLMENT_RATE = 0.08;
const earningsFor = (o) =>
  (o.deliveryFee || 0) + Math.round(o.items.reduce((n, i) => n + i.price * i.qty, 0) * FULFILLMENT_RATE);

export default function AgentApp() {
  const { orders, activeAgent, neighborhoods, refreshOrders, user } = useStore();
  const [tab, setTab] = useState("queue");

  // Poll so freshly placed customer orders appear without a manual refresh.
  useEffect(() => {
    const t = setInterval(refreshOrders, 5000);
    return () => clearInterval(t);
  }, [refreshOrders]);

  const neighborhood = neighborhoods.find((n) => n.id === activeAgent?.neighborhoodId);
  const liveOrders = useMemo(() => orders.filter((o) => o.stage !== "delivered"), [orders]);
  const doneToday = useMemo(() => orders.filter((o) => o.stage === "delivered"), [orders]);

  const earnedToday = doneToday.reduce((n, o) => n + earningsFor(o), 0);
  const pendingEarnings = liveOrders.reduce((n, o) => n + earningsFor(o), 0);

  const tabs = [
    { key: "queue", label: `Live queue${liveOrders.length ? ` · ${liveOrders.length}` : ""}` },
    { key: "inventory", label: "Inventory" },
    { key: "earnings", label: "Earnings" },
  ];

  return (
    <div>
      <Card className="mb-5 flex flex-col gap-4 p-5 animate-fade-up sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-orange/15 text-xl font-extrabold text-brand-orangeDark">
            {(activeAgent?.name || user?.name || "A")[0]}
          </span>
          <div>
            <p className="text-lg font-extrabold">{activeAgent?.name || user?.name}</p>
            <p className="text-sm text-slate-500">
              {neighborhood?.name || "Your"} runner
              {activeAgent ? ` · ★ ${activeAgent.rating} · ${activeAgent.deliveries} deliveries` : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Earned today</p>
          <p className="text-xl font-extrabold text-emerald-600">{formatMoney(earnedToday)}</p>
        </div>
      </Card>

      <div className="mb-5 flex gap-1 rounded-xl bg-brand-ink/5 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-white text-brand-ink shadow-sm" : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "queue" && <OrderQueue orders={liveOrders} earningsFor={earningsFor} />}
      {tab === "inventory" && <Inventory neighborhood={neighborhood} />}
      {tab === "earnings" && (
        <Earnings doneToday={doneToday} earnedToday={earnedToday} pendingEarnings={pendingEarnings} />
      )}
    </div>
  );
}

function Earnings({ doneToday, earnedToday, pendingEarnings }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Earned today" value={formatMoney(earnedToday)} tone="text-emerald-600" />
        <Stat label="In progress" value={formatMoney(pendingEarnings)} tone="text-brand-orangeDark" />
        <Stat label="Deliveries done" value={doneToday.length} tone="text-brand-ink" />
      </div>

      <Card className="p-5">
        <h3 className="mb-1 text-sm font-bold">How your pay works</h3>
        <p className="text-sm text-slate-500">
          You keep the full delivery fee plus an 8% fulfillment margin on every basket you handle
          in your neighborhood. Faster fulfillment and higher ratings unlock surge windows and
          priority order routing.
        </p>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold">Completed orders</h3>
        {doneToday.length === 0 ? (
          <p className="text-sm text-slate-400">No completed orders yet today.</p>
        ) : (
          <div className="space-y-2">
            {doneToday.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl border border-brand-line px-3 py-2 text-sm">
                <span className="font-semibold">#{o.id.replace("ord-", "")} · {o.customerName}</span>
                <span className="font-bold text-emerald-600">
                  +{formatMoney((o.deliveryFee || 0) + Math.round(o.items.reduce((n, i) => n + i.price * i.qty, 0) * 0.08))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
    </Card>
  );
}
