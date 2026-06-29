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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Ops console</h1>
          <p className="text-sm text-slate-500">Run the agent network across all neighborhoods.</p>
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

function Overview({ metrics }) {
  if (!metrics) return <Card className="p-8 text-center text-slate-400">Loading metrics…</Card>;
  const o = metrics.orders || {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Revenue (delivered)" value={formatMoney(metrics.revenue)} tone="text-emerald-600" />
        <Stat label="Active orders" value={o.active ?? 0} tone="text-brand-orangeDark" />
        <Stat label="Active agents" value={metrics.activeAgents ?? 0} tone="text-brand-ink" />
        <Stat label="Pending applications" value={metrics.pendingApplications ?? 0} tone="text-blue-600" />
      </div>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold">Orders by neighborhood</h3>
        {(metrics.ordersByNeighborhood || []).length === 0 ? (
          <p className="text-sm text-slate-400">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {metrics.ordersByNeighborhood.map((row) => (
              <div key={row.neighborhood_id} className="flex items-center gap-3">
                <span className="w-32 text-sm text-slate-500">{row.neighborhood_id?.replace("nb-", "")}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-brand-cloud">
                  <div className="h-full rounded-full bg-brand-orange" style={{ width: `${Math.min(100, row.c * 12)}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-bold">{row.c}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
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

function Stat({ label, value, tone }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
    </Card>
  );
}
