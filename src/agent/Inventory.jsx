import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { CATEGORIES, formatMoney } from "../data/seed.js";
import { Badge, Card } from "../components/ui.jsx";
import ProductArt from "../components/ProductArt.jsx";

// The agent's local stock. Illustrative for the MVP — each agent holds a subset
// of the catalog locally, which is what makes 27-minute fulfillment possible.
// Low-stock items are flagged for restock.
export default function Inventory({ neighborhood }) {
  const { products, activeAgent } = useStore();
  const [filter, setFilter] = useState("All");

  // Deterministic pseudo-stock per agent so it's stable across renders.
  const stock = useMemo(() => {
    const seed = (activeAgent?.id || "x").length;
    return Object.fromEntries(
      products.map((p, i) => {
        const n = (i * 7 + seed * 13) % 40;
        return [p.id, n];
      })
    );
  }, [products, activeAgent]);

  const items = products.filter((p) => filter === "All" || p.category === filter);
  const lowCount = products.filter((p) => stock[p.id] <= 5).length;

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-bold">{neighborhood?.name || "Local"} stock</p>
          <p className="text-xs text-slate-500">{products.length} SKUs held locally for instant fulfillment</p>
        </div>
        {lowCount > 0 && <Badge tone="orange">{lowCount} low / out</Badge>}
      </Card>

      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              filter === c ? "bg-brand-ink text-white" : "border border-brand-line bg-white text-slate-500"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Card className="divide-y divide-brand-line">
        {items.map((p) => {
          const n = stock[p.id];
          const tone = n === 0 ? "gray" : n <= 5 ? "orange" : "green";
          const label = n === 0 ? "Out of stock" : n <= 5 ? `Low · ${n}` : `${n} in stock`;
          return (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-brand-cloud/60">
              <ProductArt product={p} className="h-9 w-9" rounded="rounded-lg" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category} · {formatMoney(p.price)}</p>
              </div>
              <Badge tone={tone}>{label}</Badge>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
