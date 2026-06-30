import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { CATEGORIES, formatMoney } from "../data/seed.js";
import { Badge, Button, Card, inputClass, toast, Skeleton } from "../components/ui.jsx";
import ProductArt from "../components/ProductArt.jsx";
import Cart from "./Cart.jsx";
import Checkout from "./Checkout.jsx";
import OrderTracking, { promiseMiss } from "./OrderTracking.jsx";

export default function CustomerApp() {
  const { products, cartCount, orders } = useStore();
  const [view, setView] = useState("browse");
  const [trackingId, setTrackingId] = useState(null);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => products.filter((p) => (category === "All" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())),
    [products, category, query]
  );

  function goTrack(id) { setTrackingId(id); setView("track"); }

  if (view === "checkout") return <Checkout onBack={() => setView("browse")} onPlaced={goTrack} />;
  if (view === "track" && trackingId) return <OrderTracking orderId={trackingId} onBack={() => setView("browse")} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <Hero />

        <div className="mb-4 mt-6 animate-fade-up">
          <input className={inputClass} placeholder="Search anything — milk, paracetamol, a charger…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`press rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                category === c ? "bg-brand-ink text-white" : "border border-brand-line bg-white text-slate-600 hover:border-brand-ink/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
          </div>
        ) : (
          <div key={category + query} className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} i={i} />)}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-slate-400">Nothing matches “{query}”. Try another search.</p>
            )}
          </div>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Cart onCheckout={() => setView("checkout")} />
        <Wallet orders={orders} />
        {orders.length > 0 && (
          <Card className="p-4 animate-fade-up">
            <h3 className="mb-3 text-sm font-bold">Your orders</h3>
            <div className="space-y-2">
              {orders.slice(0, 5).map((o) => (
                <button key={o.id} onClick={() => goTrack(o.id)} className="press flex w-full items-center justify-between rounded-xl border border-brand-line px-3 py-2 text-left text-sm hover:border-brand-ink/30">
                  <span className="font-semibold">#{o.id.replace("ord-", "")}</span>
                  <Badge tone={o.stage === "delivered" ? "green" : "orange"}>{o.stage === "delivered" ? "Delivered" : "Track"}</Badge>
                </button>
              ))}
            </div>
          </Card>
        )}
      </aside>

      {cartCount > 0 && (
        <button onClick={() => document.querySelector("#cart-anchor")?.scrollIntoView({ behavior: "smooth" })} className="press fixed bottom-5 right-5 z-20 animate-scale-in rounded-full bg-brand-orange px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-orange/40 lg:hidden">
          Cart · {cartCount}
        </button>
      )}
    </div>
  );
}

function Wallet({ orders }) {
  const cashback = orders.reduce((n, o) => n + promiseMiss(o).cashback, 0);
  if (cashback <= 0) return null;
  return (
    <Card className="flex items-center gap-3 bg-emerald-50 p-4 animate-scale-in" >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-lg font-bold text-white">₦</span>
      <div>
        <p className="text-xs font-semibold text-emerald-700">in27 wallet · cashback</p>
        <p className="text-xl font-extrabold text-emerald-800">{formatMoney(cashback)}</p>
        <p className="text-[11px] text-emerald-600">From orders that missed our 27-min promise.</p>
      </div>
    </Card>
  );
}

function Hero() {
  const { customerNeighborhoodId, neighborhoods, setCustomerNeighborhood } = useStore();
  return (
    <Card className="overflow-hidden animate-scale-in">
      <div className="relative bg-brand-ink px-5 py-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-orange/20 blur-2xl" />
        <div className="pointer-events-none absolute right-3 top-3 text-7xl opacity-10 animate-spin-slow">⏱️</div>
        <Badge tone="orange" className="animate-fade-down">● Now live at MOUAU</Badge>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight">
          Get anything across campus in <span className="text-brand-orange">27 minutes</span>
        </h1>
        <p className="mt-1 max-w-md text-sm text-white/70">Fulfilled by a student runner in your zone — not a shop across Umudike.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm backdrop-blur">
          <span className="text-white/60">Deliver to</span>
          <select value={customerNeighborhoodId || ""} onChange={(e) => setCustomerNeighborhood(e.target.value)} className="rounded-lg bg-white px-2 py-1 font-semibold text-brand-ink outline-none">
            {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name} · {n.city}</option>)}
          </select>
        </div>
      </div>
    </Card>
  );
}

function ProductCard({ product, i }) {
  const { addToCart, cart } = useStore();
  const inCart = cart[product.id] || 0;
  return (
    <Card hover className="flex flex-col p-3" >
      <ProductArt product={product} className="mb-2 h-24 w-full" />
      <div className="flex-1">
        <p className="text-sm font-semibold leading-snug">{product.name}</p>
        <p className="text-xs text-slate-400">per {product.unit}</p>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-extrabold">{formatMoney(product.price)}</span>
        <Button
          variant={inCart ? "dark" : "primary"}
          className="!px-3 !py-1.5 text-xs"
          onClick={() => { addToCart(product.id); toast(`Added ${product.name}`, "orange"); }}
        >
          {inCart ? <span className="inline-flex items-center gap-1">Add · <span key={inCart} className="inline-block animate-pop">{inCart}</span></span> : "Add"}
        </Button>
      </div>
    </Card>
  );
}
