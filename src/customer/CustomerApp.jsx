import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { CATEGORIES, formatMoney } from "../data/seed.js";
import { Badge, Button, Card, inputClass } from "../components/ui.jsx";
import Cart from "./Cart.jsx";
import Checkout from "./Checkout.jsx";
import OrderTracking from "./OrderTracking.jsx";

// Customer storefront. Internal "view" state moves between browsing, checkout,
// and live order tracking — no router dependency needed.
export default function CustomerApp() {
  const { products, cartCount, orders } = useStore();
  const [view, setView] = useState("browse"); // browse | checkout | track
  const [trackingId, setTrackingId] = useState(null);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const inCat = category === "All" || p.category === category;
      const inQuery = p.name.toLowerCase().includes(query.toLowerCase());
      return inCat && inQuery;
    });
  }, [products, category, query]);

  function goTrack(orderId) {
    setTrackingId(orderId);
    setView("track");
  }

  if (view === "checkout")
    return <Checkout onBack={() => setView("browse")} onPlaced={goTrack} />;

  if (view === "track" && trackingId)
    return <OrderTracking orderId={trackingId} onBack={() => setView("browse")} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <Hero />

        <div className="mb-4 mt-6">
          <input
            className={inputClass}
            placeholder="Search anything — milk, paracetamol, a charger…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                category === c
                  ? "bg-brand-ink text-white"
                  : "border border-brand-line bg-white text-slate-600 hover:border-brand-ink/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-400">Loading catalog…</p>
          )}
          {products.length > 0 && filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-400">
              Nothing matches “{query}”. Try another search.
            </p>
          )}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Cart onCheckout={() => setView("checkout")} />

        {orders.length > 0 && (
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold">Your orders</h3>
            <div className="space-y-2">
              {orders.slice(0, 5).map((o) => (
                <button
                  key={o.id}
                  onClick={() => goTrack(o.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-brand-line px-3 py-2 text-left text-sm hover:border-brand-ink/30"
                >
                  <span className="font-semibold">#{o.id.replace("ord-", "")}</span>
                  <Badge tone={o.stage === "delivered" ? "green" : "orange"}>
                    {o.stage === "delivered" ? "Delivered" : "Track"}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>
        )}
      </aside>

      {cartCount > 0 && (
        <button
          onClick={() => document.querySelector("#cart-anchor")?.scrollIntoView({ behavior: "smooth" })}
          className="fixed bottom-5 right-5 z-20 rounded-full bg-brand-orange px-5 py-3 text-sm font-bold text-white shadow-lg lg:hidden"
        >
          Cart · {cartCount}
        </button>
      )}
    </div>
  );
}

function Hero() {
  const { customerNeighborhoodId, neighborhoods, setCustomerNeighborhood } = useStore();
  return (
    <Card className="overflow-hidden">
      <div className="relative bg-brand-ink px-5 py-6 text-white">
        <div className="absolute -right-6 -top-8 text-[120px] opacity-10">⏱️</div>
        <Badge tone="orange">AI-native · hyperlocal</Badge>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight">
          Get anything delivered in <span className="text-brand-orange">27 minutes</span>
        </h1>
        <p className="mt-1 max-w-md text-sm text-white/70">
          Fulfilled by a real agent in your neighborhood — not a warehouse across town.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm">
          <span className="text-white/60">Deliver to</span>
          <select
            value={customerNeighborhoodId || ""}
            onChange={(e) => setCustomerNeighborhood(e.target.value)}
            className="rounded-lg bg-white px-2 py-1 font-semibold text-brand-ink outline-none"
          >
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}, {n.city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}

function ProductCard({ product }) {
  const { addToCart, cart } = useStore();
  const inCart = cart[product.id] || 0;
  return (
    <Card className="flex flex-col p-3 transition hover:shadow-md">
      <div className="mb-2 grid h-20 place-items-center rounded-xl bg-brand-cloud text-4xl">
        {product.emoji}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-snug">{product.name}</p>
        <p className="text-xs text-slate-400">per {product.unit}</p>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-extrabold">{formatMoney(product.price)}</span>
        <Button
          variant={inCart ? "dark" : "primary"}
          className="!px-3 !py-1.5 text-xs"
          onClick={() => addToCart(product.id)}
        >
          {inCart ? `Add · ${inCart}` : "Add"}
        </Button>
      </div>
    </Card>
  );
}
