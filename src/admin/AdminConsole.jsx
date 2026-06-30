import React, { useEffect, useState } from "react";
import { useStore } from "../store.jsx";
import { formatMoney, ORDER_STAGES, stageIndex } from "../data/seed.js";
import { Badge, Button, Card } from "../components/ui.jsx";

// Ops console. Admins review and approve the agent applications the recruitment
// site captures, and see the whole network: orders, agents, and metrics.
export default function AdminConsole() {
  const { metrics, refreshMetrics, refreshOrders } = useStore();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const t = setInterval(() => {
      refreshMetrics();
      refreshOrders();
    }, 8000);
    return () => clearInterval(t);
  }, [refreshMetrics, refreshOrders]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "applications", label: "Applications" },
    { key: "orders", label: "Orders" },
    { key: "agents", label: "Agents" },
  ];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between animate-fade-down">
        <div>
          <h1 className="text-2xl font-extrabold">Ops console</h1>
          <p className="text-sm text-slate-500">Run the campus runner network across MOUAU.</p>
        </div>
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-brand-ink/5 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-white text-brand-ink shadow-sm" : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview metrics={metrics} />}
      {tab === "applications" && <Applications />}
      {tab === "orders" && <Orders />}
      {tab === "agents" && <Agents />}
    </div>
  );
}

const STAGES = [
  { key: "confirmed", label: "Confirmed" },
  { key: "assigned", label: "Assigned" },
  { key: "picking", label: "Picking" },
  { key: "delivering", label: "Delivering" },
  { key: "delivered", label: "Delivered" },
];

function Overview({ metrics }) {
  const { orders, neighborhoods } = useStore();
  if (!metrics) return <Card className="p-8 text-center text-slate-400">Loading metrics…</Card>;
  const o = metrics.orders || {};

  const zoneRows = (metrics.ordersByNeighborhood || []).map((r) => ({
    name: neighborhoods.find((n) => n.id === r.neighborhood_id)?.name || r.neighborhood_id?.replace("nb-", "") || "—",
    c: r.c,
  }));
  const zoneMax = Math.max(1, ...zoneRows.map((r) => r.c));
  const stageCounts = STAGES.map((s) => ({ ...s, c: orders.filter((ord) => ord.stage === s.key).length }));
  const stageMax = Math.max(1, ...stageCounts.map((s) => s.c));

  return (
    <div className="space-y-4">
      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Revenue (delivered)" value={formatMoney(metrics.revenue)} tone="text-emerald-600" icon="💸" />
        <Stat label="Active orders" value={o.active ?? 0} tone="text-brand-orangeDark" icon="📦" />
        <Stat label="Active runners" value={metrics.activeAgents ?? 0} tone="text-brand-ink" icon="🛵" />
        <Stat label="Pending applications" value={metrics.pendingApplications ?? 0} tone="text-blue-600" icon="📝" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Orders by zone — vertical bar chart */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-bold">Orders by campus zone</h3>
          {zoneRows.length === 0 ? <p className="text-sm text-slate-400">No orders yet.</p> : (
            <div className="flex h-44 items-end justify-around gap-3">
              {zoneRows.map((r) => (
                <div key={r.name} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-sm font-extrabold">{r.c}</span>
                  <div className="flex w-full max-w-[48px] flex-1 items-end">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-orange to-orange-400 transition-all" style={{ height: `${(r.c / zoneMax) * 100}%`, minHeight: 6 }} />
                  </div>
                  <span className="text-center text-[11px] leading-tight text-slate-500">{r.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Order pipeline funnel */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-bold">Order pipeline</h3>
          <div className="space-y-2.5">
            {stageCounts.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="w-20 text-xs text-slate-500">{s.label}</span>
                <div className="h-5 flex-1 overflow-hidden rounded-lg bg-brand-cloud">
                  <div className={`h-full rounded-lg transition-all ${s.key === "delivered" ? "bg-emerald-500" : "bg-brand-ink"}`} style={{ width: `${(s.c / stageMax) * 100}%`, minWidth: s.c ? 8 : 0 }} />
                </div>
                <span className="w-6 text-right text-sm font-bold">{s.c}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Applications() {
  const { applications, approveApplication } = useStore();
  const [busyId, setBusyId] = useState(null);
  const [result, setResult] = useState(null);

  async function decide(id, decision) {
    setBusyId(id);
    try {
      const r = await approveApplication(id, decision);
      if (decision === "approve" && r?.login) setResult({ id, login: r.login });
    } finally {
      setBusyId(null);
    }
  }

  if (applications.length === 0)
    return <Card className="p-8 text-center text-slate-400">No applications yet.</Card>;

  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold">{a.name}</p>
                <Badge tone={a.status === "approved" ? "green" : a.status === "rejected" ? "gray" : "orange"}>
                  {a.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {a.phone} · {a.neighborhoodName} · {a.vehicle} · storage: {a.hasStorage}
              </p>
            </div>
            {a.status === "pending" && (
              <div className="flex gap-2">
                <Button variant="outline" className="!py-1.5 text-xs" disabled={busyId === a.id} onClick={() => decide(a.id, "reject")}>
                  Reject
                </Button>
                <Button className="!py-1.5 text-xs" disabled={busyId === a.id} onClick={() => decide(a.id, "approve")}>
                  {busyId === a.id ? "…" : "Approve & onboard"}
                </Button>
              </div>
            )}
          </div>
          {result?.id === a.id && (
            <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              Onboarded ✓ Agent login created: <code className="font-bold">{result.login.email}</code> /{" "}
              <code className="font-bold">{result.login.password}</code>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function Orders() {
  const { orders } = useStore();
  if (orders.length === 0)
    return <Card className="p-8 text-center text-slate-400">No orders yet.</Card>;
  return (
    <Card className="divide-y divide-brand-line">
      {orders.map((o) => {
        const idx = stageIndex(o.stage);
        const total = o.items.reduce((n, i) => n + i.price * i.qty, 0) + (o.deliveryFee || 0);
        return (
          <div key={o.id} className="flex items-center gap-3 px-4 py-3">
            <span className="font-bold">#{o.id.replace("ord-", "")}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{o.customerName}</p>
              <p className="text-xs text-slate-400">{o.neighborhoodId?.replace("nb-", "")} · {o.items.length} items</p>
            </div>
            <span className="text-sm font-semibold">{formatMoney(total)}</span>
            <Badge tone={o.stage === "delivered" ? "green" : "blue"}>{ORDER_STAGES[idx]?.label}</Badge>
          </div>
        );
      })}
    </Card>
  );
}

function Agents() {
  const { agents } = useStore();
  if (agents.length === 0)
    return <Card className="p-8 text-center text-slate-400">No agents yet.</Card>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {agents.map((a) => (
        <Card key={a.id} className="flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-orange/15 text-lg font-extrabold text-brand-orangeDark">
            {a.name[0]}
          </span>
          <div className="flex-1">
            <p className="font-bold">{a.name}</p>
            <p className="text-xs text-slate-400">{a.neighborhoodId?.replace("nb-", "")} · ★ {a.rating} · {a.deliveries} deliveries</p>
          </div>
          <Badge tone={a.status === "active" ? "green" : "gray"}>{a.status}</Badge>
        </Card>
      ))}
    </div>
  );
}

function Stat({ label, value, tone, icon }) {
  return (
    <Card hover className="p-4">
      {icon && <div className="mb-1 text-lg">{icon}</div>}
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
    </Card>
  );
}
